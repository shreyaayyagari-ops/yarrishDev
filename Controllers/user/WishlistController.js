const Wishlist = require('../../Models/Wishlist');
const mongoose = require('mongoose');
const SelectedCategory = require('../../Models/selectedCategory');
const jwt = require("jsonwebtoken");
const BookingDate = require('../../Models/date.Model');
const Booking = require("../../Models/booking.js");
const Time = require('../../Models/timeModel');
const Service = require('../../Models/Service');
const Category = require('../../Models/categoriesModel');
const User = require('../../Models/userModel');
const Address = require('../../Models/address');
const Settings = require('../../Models/settings')
const crypto = require('crypto');
const axios = require('axios');
const payuConfig = require('../../Config/payUConfig');

module.exports = {

    addWishlist: async (req, res) => {
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
                return res.status(404).json({ message: 'User not found' });
            }
    
            const address = await Address.findById(addressId);
            if (!address) {
                return res.status(404).json({ message: 'Address not found' });
            }
    
            const timeExists = await Time.findById(timeId);
            if (!timeExists) {
                return res.status(400).json({ message: 'Invalid time slot.' });
            }
    
            if (!Array.isArray(serviceId) || serviceId.length === 0) {
                return res.status(400).json({ message: 'Service IDs must be a non-empty array.' });
            }
    
            const allServices = await Service.find({ _id: { $in: serviceId } });
            if (allServices.length !== serviceId.length) {
                return res.status(400).json({ message: 'Some services are invalid.' });
            }
    
            const categories = allServices.map(service => service.category.toString());
            const uniqueCategories = [...new Set(categories)];
            if (uniqueCategories.length > 1) {
                return res.status(400).json({ message: 'Services should belong to the same category.' });
            }
            const userWishlistCount = await Wishlist.countDocuments({ userId });
            if (userWishlistCount >= 5) {
                return res.status(400).json({ message: 'You can only add up to 5 wishlists.' });
            }
    
            const servicesData = allServices.map(service => ({
                serviceId: service._id.toString(),
                serviceName: service.name,
                servicePic: service.icon_path,
                category: service.category,
            }));
    
            const newWishlist = new Wishlist({
                userId, 
                date,
                time: timeExists.timeSlot,
                address: address.address,
                latitude: address.latitude,
                longitude: address.longitude,
                services: servicesData,
            });
    
            await newWishlist.save();
            return res.status(201).json({
                message: 'Wishlist added successfully.',
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    ,



    addServiceToWishlist: async (req, res) => {
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
            const servicesData = allServices.map(service => ({
                serviceId: service._id.toString(),
                serviceName: service.name,
                servicePic: service.icon_path,
                category: service.category,
            }));
            const allSettings = await Settings.findOne().sort({ createdAt: -1 });
            const uniqueCategories = new Set(allServices.map(service => service.category.toString()));
            const categoryCount = uniqueCategories.size; //no of categories
            const TotalAmount = parseFloat(categoryCount * allSettings.initialAmount)
            const newBooking = await Booking.create({
                date: date, time: timeExists.time,
                services: servicesData,
                userId: userId, userName: userData.name, userPhone: userData.phone, userEmail: userData.email,
                address: address.address, latitude: address.latitude, longitude: address.longitude,
                TotalAmount: TotalAmount
            });
            if (!newBooking) {
                return res.status(200).json({ message: "Error while creating a booking" });
            };
            return res.status(200).json({ message: "Booking created successfully", bookingId: newBooking._id });
            // if (!serviceId || !Array.isArray(serviceId) || serviceId.length === 0) {
            //     return res.status(400).json({ message: 'serviceId must be a non-empty array.' });
            // }
            // console.log(serviceId);

            // const validStatuses = ['pending', 'accepted', 'declined'];
            // if (status && !validStatuses.includes(status)) {
            //     return res.status(400).json({ message: 'Invalid status value.' });
            // }

            // const validServiceIds = [];
            // for (const id of serviceId) {
            //     if (!mongoose.Types.ObjectId.isValid(id)) {
            //         return res.status(400).json({ message: `Invalid service ID: ${id}` });
            //     }
            //     const service = await Service.findById(id);
            //     if (!service) {
            //         return res.status(404).json({ message: `Service not found for ID: ${id}` });
            //     }
            //     validServiceIds.push(id);
            // }

            // const wishlistCategory = await Category.findById(categoryId);
            // if (!wishlistCategory) {
            //     return res.status(404).json({ message: 'Category not found' });
            // }

            // const settings = await Settings.findOne();
            // if (!settings || settings.initialAmount === undefined) {
            //     return res.status(400).json({ message: 'Initial amount not found in settings.' });
            // }

            // const calculatedTotalAmount = settings.initialAmount * serviceMenCount;
            // const finalTotalAmount = TotalAmount || calculatedTotalAmount;

            // const user = await User.findById(userId);
            // if (!user) {
            //     return res.status(404).json({ message: 'User not found' });
            // }

            // const wishlistCount = await Wishlist.countDocuments({ userId: userId });
            // if (wishlistCount + validServiceIds.length > 5) {
            //     return res.status(400).json({ message: 'You can only add up to 5 services to the wishlist.' });
            // }

            // if (user.wishlistAddCount + validServiceIds.length <= 5) {
            //     user.wishlistAddCount += validServiceIds.length;
            //     await user.save();
            // }

            // let wishlistDate = await BookingDate.findOne({ date: date });
            // if (!wishlistDate) {
            //     const newDate = new BookingDate({ date: date });
            //     wishlistDate = await newDate.save();
            // }

            // const wishlistEntries = [];
            // for (const id of validServiceIds) {
            //     const wishlist = await Wishlist.create({
            //         userId: new mongoose.Types.ObjectId(userId),
            //         serviceId: new mongoose.Types.ObjectId(id),
            //         categoryId: new mongoose.Types.ObjectId(categoryId),
            //         timeId: new mongoose.Types.ObjectId(timeId),
            //         addressId: new mongoose.Types.ObjectId(addressId),
            //         status: status || 'pending',
            //         paymentStatus: 'pending',
            //         serviceMenCount,
            //         date: wishlistDate._id,
            //         TotalAmount: finalTotalAmount
            //     });

            //     const populatedWishlist = await Wishlist.findById(wishlist._id)
            //         .populate({ path: 'serviceId', select: 'name icon' })
            //         .populate({ path: 'categoryId', select: 'name' })
            //         .populate({ path: 'timeId', select: 'time' })
            //         .populate({ path: 'addressId', select: 'street city state zip' })
            //         .populate({ path: 'date', select: 'date' });

            //     let formattedDate = null;
            //     if (populatedWishlist.date) {
            //         formattedDate = populatedWishlist.date.date.toISOString().split('T')[0];
            //     }

            //     wishlistEntries.push({
            //         userId: userId,
            //         details: {
            //             ...populatedWishlist.toObject(),
            //             date: formattedDate,
            //             serviceMenCount,
            //             TotalAmount: finalTotalAmount
            //         }
            //     });
            // }

            // return res.status(201).json({
            //     message: 'Sub-Services added to wishlist successfully',
            //     wishlist: wishlistEntries
            // });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },



    deleteWishList: async (req, res) => {
        try {
            // Check for authorization header
            const userId = req.userId
            const { wishlistId } = req.params;

            // Validate wishlistId
            if (!wishlistId || !mongoose.Types.ObjectId.isValid(wishlistId)) {
                return res.status(400).json({ message: 'Invalid wishlist ID' });
            }

            // Find and delete the wishlist
            const wishlist = await Wishlist.findByIdAndDelete({ _id: wishlistId, userId }); // Ensure user ownership
            if (wishlist) {
                return res.status(200).json({ message: 'Wishlist deleted successfully' });
            } else {
                return res.status(404).json({ message: 'Wishlist not found' });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    ,

    checkoutWishlist: async (req, res) => {
        try {
            const { wishlistIds } = req.body;


            // if (!wishlistIds || !Array.isArray(wishlistIds) || wishlistIds.length === 0) {
            //     return res.status(400).json({
            //         success: false,
            //         message: "'wishlistIds' must be a non-empty array."
            //     });
            // }

            let processedWishlists = [];


            for (let wishlistId of wishlistIds) {
                const wishlist = await Wishlist.findById(wishlistId)
                // .populate('serviceId')
                // .populate('categoryId')
                // .populate('addressId')
                // .populate('serviceProviderId')
                // .populate('timeId')
                // .populate('date');

                if (!wishlist) {

                    processedWishlists.push({
                        wishlistId,
                        success: false,
                        message: "Wishlist not found."
                    });
                    continue;
                }



                await wishlist.save();


                processedWishlists.push({
                    wishlistId,
                    success: true,
                    message: "Checkout completed successfully."
                });
            }


            const successfulWishlistIds = processedWishlists
                .filter(item => item.success)
                .map(item => item.wishlistId);

            return res.status(200).json({
                success: true,
                message: "Checkout process completed for the provided wishlists.",
                data: successfulWishlistIds
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
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            const payuConfig = {
                merchantKey: process.env.PAYU_MERCHANT_KEY,
                salt: process.env.PAYU_SALT,
                authUrl: 'https://test.payu.in/_payment',
            };

            const txnid = `txn_${Date.now()}`;

            // const orderId = `Order${new Date().getTime()}`; // Generate a single orderId once
            // let totalAmount = 0;
            // let combinedServiceNames = [];
            // let paymentGatewayData = null;
            // let userDetails = null;

            // Loop through each wishlistId
            // for (const wishlistId of wishlistIds) {
            //     const wishlist = await Wishlist.findById(wishlistId)
            //         .populate('serviceId', 'name')
            //         .populate('userId', 'email phone name');

            //     if (!wishlist) {
            //         continue; // Skip invalid wishlist IDs
            //     }

            //     // Aggregate total amount
            //     totalAmount += parseFloat(wishlist.TotalAmount || '0');

            //     // Collect all service names
            //     const serviceNames = wishlist.serviceId
            //         ? wishlist.serviceId.map(service => service.name).join(', ')
            //         : 'Unknown Service';
            //     combinedServiceNames.push(serviceNames);

            //     // Save user details (from first valid wishlist)
            //     if (!userDetails) {
            //         userDetails = {
            //             userId: wishlist.userId?._id?.toString() || 'N/A',
            //             userEmail: wishlist.userId?.email || 'Unknown Email',
            //             userPhone: wishlist.userId?.phone ? String(wishlist.userId.phone) : 'Unknown Phone',
            //             userName: wishlist.userId?.name || 'Unknown Name',
            //         };
            //     }
            // }

            // if (!userDetails || combinedServiceNames.length === 0) {
            //     return res.status(400).json({ success: false, message: 'No valid wishlist IDs found' });
            // }

            // Create hash for PayU
            // const uniqueServiceNames = [...new Set(combinedServiceNames)].join(', '); // Remove duplicates and combine

            const productinfo = `Requesting for booking services`;
            const amount = (booking.TotalAmount).toString();
            const email = booking.userEmail;
            const phone = booking.userPhone.toString();
            const firstname = booking.userName;
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

            return res.status(200).json({
                message: 'Order created and payment initiated',
                paymentURL: payuConfig.authUrl,
                payUData
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    ,

    handlePaymentSuccess: async (req, res) => {
        try {
            const { status, txnid, amount, hash } = req.body;

            const wishlist = await Wishlist.findById(txnid);
            if (!wishlist) {
                return res.status(404).json({ message: 'Wishlist not found' });
            }



            const hashString = `${payuConfig.merchantKey}|${txnid}|${amount}|Booking for ${wishlist.serviceId?.map(service => service.name).join(', ')}|${wishlist.userId}|||||||||||${payuConfig.salt}`;
            const generatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

            if (generatedHash !== hash) {
                return res.status(400).json({ message: 'Hash mismatch' });
            }

            if (status === 'success') {
                wishlist.paymentStatus = 'accepted';
                wishlist.status = 'accepted';
                await wishlist.save();

                return res.status(200).json({
                    message: 'Payment successful',
                    booking: wishlist,
                });
            } else {
                return res.status(400).json({ message: 'Invalid payment status' });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    handlePaymentFailure: async (req, res) => {
        try {
            const { status, txnid, amount, hash } = req.body;

            const wishlist = await Wishlist.findById(txnid);
            if (!wishlist) {
                return res.status(404).json({ message: 'Wishlist not found' });
            }

            const hashString = `${payuConfig.merchantKey}|${txnid}|${amount}|Booking for ${wishlist.serviceId?.map(service => service.name).join(', ')}|${wishlist.userId}|||||||||||${payuConfig.salt}`;
            const generatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

            if (generatedHash !== hash) {
                return res.status(400).json({ message: 'Hash mismatch' });
            }

            if (status === 'failure') {
                wishlist.paymentStatus = 'failed';
                wishlist.status = 'declined';
                await wishlist.save();

                return res.status(200).json({
                    message: 'Payment failed',
                    booking: wishlist,
                });
            } else {
                return res.status(400).json({ message: 'Invalid payment status' });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },





    getWishlist: async (req, res) => {
        try {
            const userId = req.userId
            const wishlists = await Wishlist.find({ userId })
                .populate('serviceId', 'name icon_path')
                .populate('categoryId', 'name icon')
                .populate('timeId', 'time')
                .populate('date', 'date');

            if (!wishlists.length) {
                return res.status(404).json({
                    success: false,
                    message: "No wishlist found for the user."
                });
            }
            const formattedWishlists = wishlists.map(wishlist => {
                const transformedWishlist = wishlist.toObject();
                if (transformedWishlist.categoryId?.icon) {
                    transformedWishlist.categoryId.iconPath = transformedWishlist.categoryId.icon;
                    delete transformedWishlist.categoryId.icon;
                }
                if (transformedWishlist.date?.date) {
                    const originalDate = new Date(transformedWishlist.date.date);
                    transformedWishlist.date.date = originalDate.toISOString().split('T')[0];
                }

                return transformedWishlist;
            });
            return res.status(200).json({
                success: true,
                message: "Wishlist fetched successfully.",
                data: formattedWishlists
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }




};


