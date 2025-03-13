const Booking = require('../../Models/booking');
const Settings = require('../../Models/settings');
const { sendWelcomeNotification } = require('../../middleware/fireBaseMiddleware');
const SelectedCategory = require('../../Models/selectedCategory');
const jwt = require("jsonwebtoken");
const BookingOrder = require('../../Models/bookingOrders');
const BookingTransaction = require('../../Models/bookingTransaction');
const BookingDate = require('../../Models/date.Model');
const Time = require('../../Models/timeModel');
const Service = require('../../Models/Service');
const Category = require('../../Models/categoriesModel');
const User = require('../../Models/userModel');
const Address = require('../../Models/address');
const moment = require('moment');
const crypto = require('crypto');
const payuConfig = require('../../Config/payUConfig');
const mongoose = require('mongoose');

const notification = {
    sendWelcomeNotification: async (token, title, message, data) => {
        console.log(`Mock notification sent to ${token} with title "${title}" and message "${message}"`);
        console.log(`Additional data:`, data);
        return Promise.resolve();
    }
};

// const productinfo = `Booking for  ${booking.services.map(service => service.serviceName).join(', ')}`;


// const serviceProviderDetails = await User.findById('678dd7e8f6615bd56c606175').populate("categories");
// console.log(serviceProviderDetails);


// {
//     "serviceId": ["6794acd7a7b760203fb6dedf", "6794ae65a7b760203fb6dee7", "6794e7b710a56ed3626cbdb5"],
//     "timeId": "6780ccfabd094e055c84925d",
//     "addressId" : "6778d206b12022bcee47b885",
//     "date" : "2025-03-09"
// }

module.exports = {
    createBooking: async (req, res) => {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized: userId not found in token.' });
            }
            const { serviceId, timeId, addressId, date } = req.body;
            if (!date) {
                return res.status(400).json({ message: 'Date is required.' });
            }
            const userData = await User.findById(userId);
            if (!userData) {
                return res.status(404).json({ message: "User not found" });
            }
            const address = await Address.findById(addressId);
            if (!address) {
                return res.status(404).json({ message: 'Address not found' });
            }
            const timeExists = await Time.findById(timeId);
            if (!timeExists) {
                return res.status(400).json({ message: 'Invalid time slot' });
            }
            if (!Array.isArray(serviceId) || serviceId.length === 0) {
                return res.status(400).json({ message: 'Service IDs must be a non-empty array.' });
            }
            const allServices = await Service.find({ _id: { $in: serviceId } });
            if (allServices.length !== serviceId.length) {
                return res.status(400).json({ message: 'Some service are invalid.' });
            }
            // const categoryId =allServices[0].category;
            const categories = allServices.map(service => service.category.toString());
            const uniqueCategories = [...new Set(categories)];
            if (uniqueCategories.length > 1) {
                return res.status(400).json({ message: 'Services should belongs to same category.' });
            }
            const allSettings = await Settings.findOne().sort({ createdAt: -1 });
            const servicesData = allServices.map(service => ({
                serviceId: service._id.toString(),
                serviceName: service.name,
                servicePic: service.icon_path,
                category: service.category,
            }));
            const newBooking = await Booking.create({
                date: date, time: timeExists.time,
                services: servicesData,
                userId: userId, userName: userData.name, userPhone: userData.phone, userEmail: userData.email,
                address: address.address, latitude: address.latitude, longitude: address.longitude,
                TotalAmount: parseFloat(allSettings.initialAmount)
            });
            if (userData && userData.fcm_token && userData.fcm_token.length > 0) {
                const notificationMessage = `Your booking for ${newBooking.services.map(s => s.serviceName).join(', ')} on ${newBooking.date} at ${newBooking.time} has been confirmed.`;
                const additionalData = { providerName: "Service Provider" };
    
                for (const token of userData.fcm_token) {
                    await notification.sendWelcomeNotification(
                        token,
                        `Booking Confirmed`,
                        notificationMessage,
                        additionalData
                    );
                }
            }
            const serviceProviders = await User.find({
                _id: { $in: allServices.map(service => service.providerId) },
                role: 'service_provider'
            });
    
            for (const provider of serviceProviders) {
                if (provider.fcm_token && provider.fcm_token.length > 0) {
                    const providerNotificationMessage = `You have a new booking for ${newBooking.services.map(s => s.serviceName).join(', ')} on ${newBooking.date} at ${newBooking.time}.`;
                    const providerAdditionalData = { userName: userData.name, bookingId: newBooking._id };
    
                    for (const token of provider.fcm_token) {
                        await notification.sendWelcomeNotification(
                            token,
                            `New Booking Assigned`,
                            providerNotificationMessage,
                            providerAdditionalData
                        );
                    }
                }
            }
            if (!newBooking) {
                return res.status(200).json({ message: "Error while creating a booking" });
            };
            return res.status(200).json({ message: "Booking created successfully", bookingId: newBooking._id });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    // const parsedServiceIds = Array.isArray(serviceId) ? serviceId : [serviceId];
    // if (!Array.isArray(parsedServiceIds) || parsedServiceIds.length === 0) {
    //     return res.status(400).json({ message: 'serviceId must be a non-empty array or a single valid ID.' });
    // }
    // const invalidServiceIds = parsedServiceIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    // if (invalidServiceIds.length > 0) {
    //     return res.status(400).json({ message: `Invalid service ID(s): ${invalidServiceIds.join(', ')}` });
    // }
    // const services = await Service.find({ '_id': { $in: parsedServiceIds } });
    // const foundServiceIds = services.map(service => service._id.toString());
    // const notFoundServiceIds = parsedServiceIds.filter(id => !foundServiceIds.includes(id));
    // if (notFoundServiceIds.length > 0) {
    //     return res.status(404).json({ message: `Service(s) not found for ID(s): ${notFoundServiceIds.join(', ')}` });
    // }
    // const bookingCategory = await Category.findById(categoryId);
    // if (!bookingCategory) {
    //     return res.status(404).json({ message: 'Category not found' });
    // }
    // const settings = await Settings.findOne();
    // if (!settings || settings.initialAmount === undefined) {
    //     return res.status(500).json({ message: 'Initial amount not found in settings.' });
    // }
    // const totalAmount = settings.initialAmount * parsedServiceIds.length;
    // let bookingDate = await BookingDate.findOne({ date: date });
    // if (!bookingDate) {
    //     const newDate = new BookingDate({ date: date });
    //     bookingDate = await newDate.save();
    // }
    // const booking = await Booking.create({
    //     userId: new mongoose.Types.ObjectId(userId),
    //     serviceId: parsedServiceIds.map(id => new mongoose.Types.ObjectId(id)),
    //     categoryId: new mongoose.Types.ObjectId(categoryId),
    //     timeId: new mongoose.Types.ObjectId(timeId),
    //     addressId: new mongoose.Types.ObjectId(addressId),
    //     status: status || 'pending',
    //     paymentStatus: 'pending',
    //     serviceMenCount,
    //     date: bookingDate._id,
    //     TotalAmount: totalAmount
    // });

    // return res.status(201).json({
    //     message: 'Booking created successfully.',
    //     booking
    // });




    checkoutBooking: async (req, res) => {
        try {
            const { bookingId } = req.body;

            if (!bookingId) {
                return res.status(400).json({ message: 'Booking ID is required.' });
            }

            if (!mongoose.Types.ObjectId.isValid(bookingId)) {
                return res.status(400).json({ message: 'Invalid Booking ID.' });
            }

            const booking = await Booking.findById(bookingId).populate('userId').populate('date');
            const user = await User.findById(booking.userId);

            if (userdata && userdata.fcm_token.length > 0) {
                const notificationMessage = `You have a Booking request for ${booking.servicename} on ${booking.date} at ${booking.time}.`;
                const additionalData = {
                    type: 'booking_request',
                    bookingId: booking._id
                };
                for (const token of userdata.fcm_token) {
                    await notification.sendWelcomeNotification(
                        token,
                        ` ${serviceProvider.name}`,
                        notificationMessage,
                        additionalData
                    );
                }
            }


            if (!booking) {
                return res.status(404).json({ message: 'Booking not found.' });
            }

            // if (booking.paymentStatus === 'completed') {
            //     return res.status(400).json({ message: 'Payment already completed for this booking.' });
            // }

            // booking.paymentStatus = 'completed';
            await booking.save();

            return res.status(200).json({
                message: 'Checkout completed successfully.',
                bookingId: booking._id
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },





    initiatePayment: async (req, res) => {
        try {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const { bookingId } = req.body;
            const booking = await Booking.findById(bookingId)
            // console.log(booking)
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            const payuConfig = {
                merchantKey: process.env.PAYU_MERCHANT_KEY,
                salt: process.env.PAYU_SALT,
                authUrl: 'https://test.payu.in/_payment',
            };
            const allSettings = await Settings.findOne().sort({ createdAt: -1 });
            const productinfo = `Requesting for booking services`;
            const amount = (booking.TotalAmount || allSettings.initialAmount).toString();
            const email = booking.userEmail;
            const phone = booking.userPhone.toString();
            const firstname = booking.userName;

            const txnid = `txn_${Date.now()}`;
            const hashString = `${payuConfig.merchantKey}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${payuConfig.salt}`;
            const hash = crypto.createHash("sha512").update(hashString).digest("hex");

            const payUData = {
                key: payuConfig.merchantKey,
                txnid: txnid,
                amount: amount,
                productinfo: productinfo,
                firstname: firstname,
                email: email,
                phone: phone,
                surl: `${baseUrl}/payment/success`,
                furl: `${baseUrl}/payment/failure`,
                hash: hash,
                service_provider: "payu_paisa"
            };

            const bookingOrder = new BookingOrder({
                bookingId: booking._id,
                userId: booking.userId,
                firstname: firstname,
                email: email,
                phone: phone,
                txnId: txnid,
                amount: amount,
            });
    
            await bookingOrder.save(); 
            return res.status(200).json({
                message: 'Payment initiation data generated.',
                paymentURL: payuConfig.authUrl,
                payUData
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },




    handlePaymentSuccess: async (req, res) => {
        try {
            const { status, txnid, amount, hash } = req.body;
    
            const booking = await Booking.findOne({ 'booking.paymentId': txnid });
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }
    
            const hashString = `${payuConfig.merchantKey}|${txnid}|${amount}|Booking for ${booking.services.map(service => service.serviceName).join(', ')}|${booking.userId}|||||||||||${payuConfig.salt}`;
            const generatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
            
            // if (generatedHash !== hash) {
            //     return res.status(400).json({ message: 'Hash mismatch' });
            // }
    
            if (status === 'success') {
                booking.paymentStatus = 'success';
                booking.bookingStatus = 'booked';
                booking.transactionAmount = amount;
                booking.paymentId = txnid;
                await booking.save();
                const newBookingTransaction = new BookingTransaction({
                    userId: booking.userId,
                    userName: booking.userName,
                    userPhone: booking.userPhone,
                    userEmail: booking.userEmail,
                    serviceProviderId: booking.serviceProviderId,
                    serviceProviderName: booking.serviceProviderName,
                    serviceProviderPhone: booking.serviceProviderPhone,
                    serviceProviderEmail: booking.serviceProviderEmail,
                    services: booking.services,
                    booking: booking._id,
                    bookingDate: booking.bookingDate,
                    bookingTime: booking.bookingTime,
                    bookingAmount: booking.bookingAmount,
                    bookingStatus: 'booked',
                    paymentStatus: 'success',
                    paymentId: txnid,
                    transactionAmount: amount,
                });
                await newBookingTransaction.save();
                const newBookingOrder = new BookingOrder({
                    bookingId: booking._id,
                    userId: booking.userId,
                    firstname: booking.userName,
                    email: booking.userEmail,
                    phone: booking.userPhone,
                    txnId: txnid,
                    amount: amount.toString(),
                });
                await newBookingOrder.save();
                return res.status(200).json({
                    message: 'Payment successful and booking confirmed',
                    booking,
                    transaction: newBookingTransaction,
                    order: newBookingOrder,
                });
            } else {
                return res.status(400).json({ message: 'Invalid payment status' });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    cancelBooking: async (req, res) => {
        try {
            const { bookingId } = req.params;
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            if (booking.bookingStatus === 'canceled') {
                return res.status(400).json({ message: 'Booking is already canceled' });
            }
            if (!booking.time) {
                return res.status(400).json({
                    message: 'Booking time is not defined, cannot proceed with cancellation checks.',
                });
            }
            if (!booking.date) {
                return res.status(400).json({
                    message: 'Booking date is not defined, cannot proceed with cancellation checks.',
                });
            }
            const currentTime = new Date();
            const bookingDateTime = new Date(booking.date);
            const [hour, minute] = booking.time.split(':').map(Number);
            bookingDateTime.setHours(hour);
            bookingDateTime.setMinutes(minute);
            const cancelThreshold = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000)
            if (currentTime > cancelThreshold && currentTime <= bookingDateTime) {
                return res.status(400).json({
                    message: 'Booking cannot be canceled within 2 hours of the scheduled time.',
                });
            }
            booking.bookingStatus = 'canceled';
            await booking.save();
            return res.status(200).json({
                message: 'Booking has been canceled successfully.',
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    getdeclinedBookings: async (req, res) => {
        try {
            const serviceProviderId = req.userId;
            // console.log(serviceProviderId);
            const declinedBooking = await Booking.find({
                serviceProviderId: serviceProviderId,
                bookingStatus: 'declined'
            });

            if (!declinedBooking || declinedBooking.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No declined bookings found',
                });
            }
            const formattedBookings = await Promise.all(declinedBooking.map(async (booking) => {
                const servicesWithCategory = await Promise.all(booking.services.map(async (service) => {
                    const category = service.category ? await Category.findById(service.category) : null;
                    return {
                        category: category ? category.name : null,
                        serviceId: service.serviceId || null,
                        serviceName: service.serviceName || null,
                        servicePic: service.servicePic || null,
                    };
                }));
                const user = booking.userId ? await User.findById(booking.userId) : null;
                const serviceProvider = booking.serviceProviderId ? await User.findById(booking.serviceProviderId) : null;

                return {
                    bookingId: booking._id,
                    date: booking.date ? booking.date.toISOString().split('T')[0] : null,
                    time: booking.time || null,
                    services: servicesWithCategory,
                    userId: user ? user._id : null,
                    userName: user ? user.name : null,
                    userPhone: user ? user.phone : null,
                    userEmail: user ? user.email : null,
                    address: booking.address || null,
                    latitude: booking.latitude || null,
                    longitude: booking.longitude || null,
                    serviceProviderId: serviceProvider ? serviceProvider._id : null,
                    serviceProviderName: serviceProvider ? serviceProvider.name : null,
                    serviceProviderPhone: serviceProvider ? serviceProvider.phone : null,
                    serviceProviderEmail: serviceProvider ? serviceProvider.email : null,
                    totalAmount: booking.TotalAmount || null,
                    paymentStatus: booking.paymentStatus || null,
                    bookingStatus: booking.bookingStatus || null,
                };
            }));

            const response = {
                success: true,
                totalDeclinedBookings: formattedBookings.length,
                bookings: formattedBookings,
            };

            return res.status(200).json(response);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },



    getPendingBookings: async (req, res) => {
        try {
            const userId = req.userId;
            const pendingBookings = await Booking.find({
                userId: userId,
                bookingStatus: 'pending'
            });
            if (!pendingBookings || pendingBookings.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No pending bookings found',
                });
            }
            const formattedBookings = pendingBookings.map((booking) => {
                return {
                    bookingId: booking._id,
                    date: booking.date ? booking.date.toISOString().split('T')[0] : null,
                    time: booking.time || null,
                    services: booking.services.map((service) => ({
                        category: service.category || null,
                        serviceId: service.serviceId || null,
                        serviceName: service.serviceName || null,
                        servicePic: service.servicePic || null,
                    })),
                    userId: booking.userId || null,
                    userName: booking.userName || null,
                    userPhone: booking.userPhone || null,
                    userEmail: booking.userEmail || null,
                    address: booking.address || null,
                    latitude: booking.latitude || null,
                    longitude: booking.longitude || null,
                    // serviceProviderId: booking.serviceProviderId || null,
                    // serviceProviderName: booking.serviceProviderName || null,
                    // serviceProviderPhone: booking.serviceProviderPhone || null,
                    // serviceProviderEmail: booking.serviceProviderEmail || null,
                    totalAmount: booking.TotalAmount || null,
                    paymentStatus: booking.paymentStatus || null,
                    bookingStatus: booking.bookingStatus || null,
                };
            });
            const response = {
                success: true,
                totalPendingBookings: formattedBookings.length,
                bookings: formattedBookings,
            };
            return res.status(200).json(response);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },



    getTodaysBookings: async (req, res) => {
        try {
            const startOfDay = moment().startOf('day').toDate();
            const endOfDay = moment().endOf('day').toDate();

            const todaysBookings = await Booking.find({
                date: { $gte: startOfDay, $lte: endOfDay }
            });

            return res.status(200).json({ message: todaysBookings });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    ,

    getUpcomingBookings: async (req, res) => {
        try {
            const currentDate = new Date();
            const upcomingBookings = await Booking.find({
                $or: [
                    { date: { $gt: currentDate } },
                    { $and: [{ date: { $eq: currentDate } }, { time: { $gt: currentDate.toISOString().split('T')[1].split('.')[0] } }] }, // Check if the time on the current day is in the future
                ],
            })
                .sort({ date: 1, time: 1 });

            return res.status(200).json({ message: upcomingBookings });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    acceptBooking: async (req, res) => {
        try {
            const loggedInUserId = req.userId;
            const { bookingId } = req.params;
            const { status } = req.body;
            const validStatuses = ['accepted', 'declined'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Invalid status value. Allowed values: accepted, declined.' });
            }
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found.' });
            }
            const serviceProvider = await User.findById(loggedInUserId);
            if (!serviceProvider) {
                return res.status(404).json({ message: 'Service provider not found.' });
            }
            booking.bookingStatus = status;

            if (status === 'accepted') {
                booking.serviceProviderId = serviceProvider._id;
                booking.serviceProviderName = serviceProvider.name;
                booking.serviceProviderPhone = serviceProvider.phone;
                booking.serviceProviderEmail = serviceProvider.email;
            }
            const user = await User.findById(booking.userId);
            if (user && user.fcm_token && user.fcm_token.length > 0) {
                const notificationMessage = `Your booking for ${booking.services.map(s => s.serviceName).join(', ')} on ${booking.date} at ${booking.time} has been ${status}.`;
                const additionalData = { providerName: serviceProvider.name };

                for (const token of user.fcm_token) {
                    await notification.sendWelcomeNotification(
                        token,
                        `Booking ${status}`,
                        notificationMessage,
                        additionalData
                    );
                }
            }
            await booking.save();

            return res.status(200).json({
                message: `Booking ${status} successfully by the service provider.`,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    ,

    getAcceptedBookings: async (req, res) => {
        try {
            const loggedInUserId = req.userId


            const acceptedBookings = await Booking.find({
                status: 'accepted',
                serviceProviderId: loggedInUserId
            }).populate('serviceProviderId', 'name phone');


            if (acceptedBookings.length === 0) {
                return res.status(404).json({
                    message: 'No accepted bookings found for this service provider.',
                    data: []
                });
            }


            const response = acceptedBookings.map(booking => ({
                bookingId: booking._id,
                serviceDetails: booking.serviceDetails,
                date: booking.date,
                time: booking.time,
                customerName: booking.customerName,
                serviceProvider: {
                    name: booking.serviceProviderId.name,
                    phone: booking.serviceProviderId.phone
                },
                status: booking.status
            }));

            return res.status(200).json({
                message: 'Accepted bookings fetched successfully.',
                data: response
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },


    // getServiceProviderDetails: async (req, res) => {
    //     try {
    //         // Extract the token and decode it to get the userId
    //         const token = req.headers.authorization.split(' ')[1];
    //         const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //         const userId = decoded.id; // Extract userId from the token

    //         // Query the Booking model to get all bookings for the user
    //         const userBookings = await Booking.find({ userId })
    //             .populate('serviceProviderId', 'name phone') // Populate service provider details
    //             .populate('serviceId', 'name') 
    //             .populate('categoryId', 'name') 
    //             .populate('addressId', 'address') 
    //             .lean(); 

    //         if (!userBookings || userBookings.length === 0) {
    //             return res.status(404).json({ message: 'No bookings found for this user.' });
    //         }


    //         const formattedBookings = userBookings.map(booking => ({
    //             bookingId: booking._id,
    //             status: booking.status,
    //             paymentStatus: booking.paymentStatus,
    //             totalAmount: booking.TotalAmount,
    //             serviceProvider: booking.serviceProviderId
    //                 ? {
    //                     name: booking.serviceProviderId.name,
    //                     phone: booking.serviceProviderId.phone,
    //                 }
    //                 : null,
    //             serviceDetails: booking.serviceId,
    //             category: booking.categoryId,
    //             address: booking.addressId,
    //             date: booking.date,
    //             time: booking.time,
    //         }));


    //         return res.status(200).json({
    //             message: 'Bookings retrieved successfully.',
    //             bookings: formattedBookings,
    //         });
    //     } catch (error) {
    //         console.error('Error in getUserBookings:', error);
    //         return res.status(500).json({ message: 'Server error', error: error.message });
    //     }
    // }

    // ,




    declineBooking: async (req, res) => {
        try {
            const { bookingId } = req.params;
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found.' });
            }
            booking.bookingStatus = 'declined';
            const user = await User.findById(booking.userId);
            if (user && user.fcm_token && user.fcm_token.length > 0) {
                const notificationMessage = `Your booking for services on ${booking.date} at ${booking.time} has been declined.`;
                const notificationTitle = `Booking Declined`;
                for (const token of user.fcm_token) {
                    await notification.sendWelcomeNotification(
                        token,
                        notificationTitle,
                        notificationMessage,
                        {}
                    );
                }
            }
            await booking.save();
            return res.status(200).json({
                message: 'Booking declined successfully.',
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    // getServiceProviderBookings: async (req, res) => {
    //     try {
    //         const serviceProviderId = req.userId

    //         const bookings = await Booking.find({ serviceProviderId })
    //             .populate({ path: 'serviceId', select: 'name description price' })
    //             .populate({
    //                 path: 'serviceProviderId',
    //                 select: 'name contact status',
    //                 model: 'User'
    //             })
    //             .populate({
    //                 path: 'addressId',
    //                 select: 'street city state postalCode country'
    //             })
    //             .populate({
    //                 path: 'timeId',
    //                 select: 'time'
    //             })
    //             .select('date timeId status icon addressId');

    //         const filteredBookings = bookings.filter(booking => booking.addressId !== null);

    //         // if (!filteredBookings || filteredBookings.length === 0) {
    //         //     return res.status(404).json({ message: 'No bookings found for this service provider with valid addresses.' });
    //         // }

    //         return res.status(200).json({ booking: filteredBookings });

    //     } catch (error) {
    //         console.log(error);
    //         return res.status(500).json({ message: 'Internal Server Error' });
    //     }
    // },
    getBookingHistory: async (req, res) => {
        try {
            const userId = req.userId;
            const bookings = await Booking.find({ userId });

            if (!bookings || bookings.length === 0) {
                return res.status(404).json({ message: 'No bookings found' });
            }
            const activeBookings = bookings.filter(booking => booking.bookingStatus !== 'canceled');
            const canceledBookings = bookings.filter(booking => booking.bookingStatus === 'canceled');
            const formatBooking = (booking) => ({
                id: booking._id,
                date: booking.date,
                time: booking.time,
                services: booking.services.map(service => ({
                    category: service.category,
                    serviceId: service.serviceId,
                    serviceName: service.serviceName,
                    servicePic: service.servicePic,
                })),
                userDetails: {
                    userId: booking.userId,
                    userName: booking.userName,
                    userPhone: booking.userPhone,
                    userEmail: booking.userEmail,
                },
                addressDetails: {
                    address: booking.address,
                    latitude: booking.latitude,
                    longitude: booking.longitude,
                },
                serviceProviderDetails: {
                    serviceProviderId: booking.serviceProviderId,
                    serviceProviderName: booking.serviceProviderName,
                    serviceProviderPhone: booking.serviceProviderPhone,
                    serviceProviderEmail: booking.serviceProviderEmail,
                },
                totalAmount: booking.TotalAmount,
                paymentStatus: booking.paymentStatus,
                bookingStatus: booking.bookingStatus,
                createdAt: booking.createdAt,
                updatedAt: booking.updatedAt,
            });
            const formattedActiveBookings = activeBookings.map(formatBooking);
            const formattedCanceledBookings = canceledBookings.map(formatBooking);
            const bookingHistory = {
                activeBookings: formattedActiveBookings,
                canceledBookings: formattedCanceledBookings,
            };
            return res.status(200).json(bookingHistory);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },


    // getBookingById: async (req, res) => {
    //     try {
    //         const { bookingId } = req.params;


    //         if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    //             return res.status(400).json({ message: 'Invalid booking ID.' });
    //         }


    //         const booking = await Booking.findById(bookingId)
    //             .populate({
    //                 path: 'serviceId',
    //                 select: 'name icon_path'
    //             })
    //             .populate({
    //                 path: 'categoryId',
    //                 select: 'name'
    //             })
    //             .populate({
    //                 path: 'timeId',
    //                 select: 'time'
    //             })
    //             .populate({
    //                 path: 'addressId',
    //                 select: 'address latitude longitude'
    //             })
    //             .populate({
    //                 path: 'date',
    //                 select: 'date'
    //             })
    //             .populate({
    //                 path: 'serviceProviderId',
    //                 select: 'name email phone photo'
    //             });

    //         if (!booking) {
    //             return res.status(404).json({ message: 'Booking not found.' });
    //         }


    //         let formattedDate = null;
    //         if (booking.date) {
    //             formattedDate = booking.date.date.toISOString().split('T')[0];
    //         }


    //         let serviceProvider = [];
    //         if (booking.serviceProviderId) {
    //             serviceProvider = [{
    //                 ...booking.serviceProviderId.toObject(),
    //                 phone: booking.serviceProviderId.phone.toString()
    //             }];
    //         }

    //         return res.status(200).json({
    //             message: 'Booking retrieved successfully',
    //             booking: {
    //                 ...booking.toObject(),
    //                 date: formattedDate,
    //                 serviceProviderId: serviceProvider
    //             }
    //         });

    //     } catch (error) {
    //         console.log(error);
    //         return res.status(500).json({ message: 'Internal Server Error' });
    //     }
    // },


    // getBookingofServiceProviderById: async (req, res) => {
    //     try {

    //         const userId = req.userId
    //         const { bookingId } = req.params;


    //         if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    //             return res.status(400).json({ message: 'Invalid booking ID.' });
    //         }

    //         const booking = await Booking.findOne({
    //             _id: bookingId,
    //             userId: userId
    //         })
    //             .populate({
    //                 path: 'serviceId',
    //                 select: 'name icon'
    //             })
    //             .populate({
    //                 path: 'categoryId',
    //                 select: 'name'
    //             })
    //             .populate({
    //                 path: 'timeId',
    //                 select: 'time'
    //             })
    //             .populate({
    //                 path: 'addressId',
    //                 select: 'street city state zip'
    //             })
    //             .populate({
    //                 path: 'date',
    //                 select: 'date'
    //             });

    //         // if (!booking) {
    //         //     return res.status(404).json({ message: 'Booking not found or not accessible by this service provider.' });
    //         // }

    //         let formattedDate = null;
    //         if (booking.date) {
    //             formattedDate = booking.date.date.toISOString().split('T')[0];
    //         }

    //         return res.status(200).json({
    //             message: 'Booking retrieved successfully',
    //             booking: {
    //                 ...booking.toObject(),
    //                 date: formattedDate
    //             }
    //         });
    //     } catch (error) {
    //         console.log(error);
    //         return res.status(500).json({ message: 'Internal Server Error' });
    //     }
    // },


    // getBookings: async (req, res) => {
    //     try {
    //         const bookings = await Booking.find({})
    //             .populate('userId')
    //             .populate('serviceId', 'name icon')
    //             .populate('categoryId', 'name')
    //             .populate('addressId', 'address latitude longitude')
    //             .populate('serviceProviderId', 'name')
    //             .populate('timeId', 'time')
    //             .populate('date')
    //             .sort({ createdAt: -1 });

    //         if (!bookings || bookings.length === 0) {
    //             return res.status(404).json({ message: 'No bookings found' });
    //         }

    //         return res.status(200).json({
    //             message: 'Bookings fetched successfully',
    //             bookings
    //         });
    //     } catch (error) {
    //         console.log(error);
    //         return res.status(500).json({ message: 'Internal Server Error' });
    //     }
    // },

    completeBooking: async (req, res) => {
        try {
            const userId = req.userId;
            const { bookingId } = req.params;
            const { status } = req.body;
            const validStatuses = ['completed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Invalid status value.' });
            }
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found.' });
            }
            if (!booking.serviceProviderId) {
                return res.status(400).json({ message: 'Booking does not have a service provider assigned.' });
            }
            if (booking.serviceProviderId.toString() !== userId) {
                return res.status(403).json({ message: 'You are not authorized to complete this booking.' });
            }
            if (booking.bookingStatus === 'completed') {
                return res.status(400).json({ message: 'Booking is already completed.' });
            }
            booking.bookingStatus = 'completed';
            const serviceProvider = await User.findById(booking.serviceProviderId);
            const user = await User.findById(booking.userId);
            if (user && user.fcm_token && user.fcm_token.length > 0) {
                const notificationMessage = `Your service request has been completed. Service was provided by ${serviceProvider ? serviceProvider.name : 'the service provider'} on ${booking.date} at ${booking.time}.`;

                const additionalData = {
                    serviceProviderName: serviceProvider ? serviceProvider.name : 'Service Provider',
                    bookingDate: booking.date,
                    bookingTime: booking.time,
                }
                for (const token of user.fcm_token) {
                    await notification.sendWelcomeNotification(
                        token,
                        `Service Completed by ${serviceProvider ? serviceProvider.name : 'Service Provider'}`,
                        notificationMessage,
                        additionalData
                    );
                }
            }
            await booking.save();

            return res.status(200).json({
                message: 'Booking completed successfully.',
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    getAllCompletedBookings: async (req, res) => {
        try {
            const serviceProviderId = req.userId;
            const completedBookings = await Booking.find({
                serviceProviderId: serviceProviderId,
                bookingStatus: 'completed',
            });
            if (completedBookings.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No completed bookings found',
                });
            }
            const formattedBookings = completedBookings.map((booking) => ({
                bookingId: booking._id,
                userId: booking.userId,
                userName: booking.userName || null,
                userPhone: booking.userPhone || null,
                userEmail: booking.userEmail || null,
                services: booking.services.map((service) => ({
                    category: service.category || null,
                    serviceId: service.serviceId || null,
                    serviceName: service.serviceName || null,
                    servicePic: service.servicePic || null,
                })),
                address: booking.address || null,
                latitude: booking.latitude || null,
                longitude: booking.longitude || null,
                date: booking.date ? moment(booking.date).format('YYYY-MM-DD') : null,
                time: booking.time || null,
                totalAmount: booking.TotalAmount || null,
                status: booking.bookingStatus,
            }));
            return res.status(200).json({
                success: true,
                message: 'Completed bookings fetched successfully',
                totalBookings: formattedBookings.length,
                bookings: formattedBookings,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
            });
        }
    },

    getBookingCounts: async (req, res) => {
        try {
            const serviceProviderId = req.userId
            const today = moment().startOf('day').toDate();
            const endOfDay = moment().endOf('day').toDate();
            const now = moment().toDate();
            const completedCount = await Booking.countDocuments({
                status: 'completed',
                serviceProviderId
            });

            const todaysBookingDates = await BookingDate.find({
                date: { $gte: today, $lte: endOfDay }
            });

            const todaysCount = await Booking.countDocuments({
                serviceProviderId,
                date: { $in: todaysBookingDates.map(date => date._id) }
            });

            const declinedCount = await Booking.countDocuments({
                status: 'declined',
                serviceProviderId
            });

            const upcomingCount = await Booking.countDocuments({
                serviceProviderId: serviceProviderId,
                $or: [
                    {
                        $expr: {
                            $gte: [
                                { $ifNull: [{ $dateFromString: { dateString: "$date.date" } }, new Date()] },
                                now
                            ]
                        }
                    },
                    {
                        timeId: { $ne: null },
                        $expr: {
                            $gte: [
                                { $ifNull: [{ $dateFromString: { dateString: "$timeId.time" } }, new Date()] },
                                now
                            ]
                        }
                    }
                ]
            });
            const response = {
                success: true,
                counts: {
                    completed: completedCount.toString(),
                    today: todaysCount.toString(),
                    declined: declinedCount.toString(),
                    upcoming: upcomingCount.toString()
                }
            };

            return res.status(200).json(response);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    ,

    //upcoming
    getUpcomingBookingsForServiceProvider: async (req, res) => {
        try {
            const serviceProviderId = req.userId;
            const now = moment();
            const bookings = await Booking.find({
                serviceProviderId: serviceProviderId,
                $or: [
                    { date: { $gte: now.toDate() } },
                    { time: { $ne: null } },
                ],
            });
            if (bookings.length === 0) {
                return res.status(200).json({
                    success: true,
                    bookings: [],
                });
            }
            const formattedBookings = bookings.map((booking) => {
                return {
                    bookingId: booking._id,
                    time: booking.time || null,
                    userId: booking.userId || null,
                    userName: booking.userName || null,
                    userPhone: booking.userPhone || null,
                    userEmail: booking.userEmail || null,
                    services: booking.services.map((service) => ({
                        category: service.category,
                        serviceId: service.serviceId,
                        serviceName: service.serviceName,
                        servicePic: service.servicePic,
                    })),
                    address: booking.address || null,
                    latitude: booking.latitude || null,
                    longitude: booking.longitude || null,
                    date: booking.date ? moment(booking.date).format("YYYY-MM-DD") : null,
                    status: booking.bookingStatus || "pending",
                    totalAmount: booking.TotalAmount || null,
                    paymentStatus: booking.paymentStatus || "pending",
                };
            });
            const response = {
                success: true,
                totalBookings: formattedBookings.length,
                bookings: formattedBookings,
            };
            return res.status(200).json(response);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },


    getBookingDetails: async (req, res) => {
        try {
            const { bookingId } = req.params;
            const bookingDetails = await Booking.findById(bookingId);
            if (!bookingDetails) {
                return res.status(404).json({
                    success: false,
                    message: "No booking details found",
                });
            }
            const formattedBooking = {
                bookingId: bookingDetails._id,
                date: bookingDetails.date ? moment(bookingDetails.date).format("YYYY-MM-DD") : null,
                time: bookingDetails.time || null,
                services: bookingDetails.services.map((service) => ({
                    category: service.category || null,
                    serviceId: service.serviceId || null,
                    serviceName: service.serviceName || null,
                    servicePic: service.servicePic || null,
                })),
                user: {
                    userId: bookingDetails.userId || null,
                    userName: bookingDetails.userName || null,
                    userPhone: bookingDetails.userPhone || null,
                },
                address: {
                    address: bookingDetails.address || null,
                    latitude: bookingDetails.latitude || null,
                    longitude: bookingDetails.longitude || null,
                },
                serviceProvider: {
                    serviceProviderId: bookingDetails.serviceProviderId || null,
                    serviceProviderName: bookingDetails.serviceProviderName || null,
                    serviceProviderPhone: bookingDetails.serviceProviderPhone || null,
                },
                totalAmount: bookingDetails.TotalAmount || null,
                paymentStatus: bookingDetails.paymentStatus || "pending",
                bookingStatus: bookingDetails.bookingStatus || "pending",
            };

            return res.status(200).json({
                success: true,
                message: "Booking details fetched successfully",
                booking: formattedBooking,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

};