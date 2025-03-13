const path = require("path");
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require("../../Models/userModel.js");
const Country = require('../../Models/Country.js');
const Booking = require("../../Models/booking.js");
const Subscription = require("../../Models/Subscription.js");
// const buyer = require("../../models/vendorModels/buyerModel.js");
const Setting = require("../../Models/settings.js");
// const plans = require("../../models/adminModels/planModel.js");
// const category = require("../../models/adminModels/categoryModel.js");
const isAdmin = require('../../middleware/authMiddleware.js');
const handleFileUpload = require('../../middleware/authMiddleware.js');
const SelectedCategories = require('../../Models/selectedCategory.js');
const AWS = require('aws-sdk');
const { cp } = require("fs");

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

module.exports = {
    dashBoard: async (req, res) => {
        try {
            let completed = 0;
            let pending = 0;
            let cancelled = 0;
            let declined = 0;
            let accepted = 0;

            const data = await Booking.aggregate([
                {
                    $group: {
                        _id: "$status", // Group by the 'status' field
                        count: { $sum: 1 }, // Count the number of documents for each status
                    },
                },
            ]);
            const service_provider = await User.countDocuments({ role: 'service_provider' });
            const user = await User.countDocuments({ role: 'user' });
            const movie_theater = await User.countDocuments({ role: 'movie_theater' });
            const admin = await User.countDocuments({ role: 'admin' });
            let outdata2 = [service_provider, user, movie_theater, admin];
            for (let i = 0; i < data.length; i++) {
                if (data[i]._id === 'completed') {
                    completed = data[i].count;
                } else if (data[i]._id === 'pending') {
                    pending = data[i].count;
                } else if (data[i]._id === 'cancelled') {
                    cancelled = data[i].count;
                } else if (data[i]._id === 'declined') {
                    declined = data[i].count;
                } else if (data[i]._id === 'accepted') {
                    accepted = data[i].count;
                }
            }
            const outdata = [pending, accepted, declined, completed, cancelled];
            return res.render("dashboard", {
                data: outdata,
                data2: outdata2,
                success: req.flash("success"),
                error: req.flash("error"),
            });
        } catch (error) {
            //console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    },

    dashboardData: async (req, res) => {
        try {
            const adminsCount = await User.countDocuments({ role: 'admin' });
            const usersCount = await User.countDocuments({ role: 'user' });
            const serviceProvidersCount = await User.countDocuments({ role: 'service_provider' });
            const movieTheatersCount = await User.countDocuments({ role: 'movie_theater' });

            const dashboardData = {
                Admins: adminsCount,
                Users: usersCount,
                ServiceProviders: serviceProvidersCount,
                MovieTheaters: movieTheatersCount
            };

            res.render('dashboard', {
                success: req.flash('success'),
                error: req.flash('error'),
                ...dashboardData
            });

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            req.flash('error', 'Failed to load dashboard data');
            res.redirect('/error');
        }
    }
    ,

    Profile: async (req, res) => {
        try {
            const userId = req.session.admin._id;
            if (!userId) {
                req.flash("error", "Invalid user Id");
                return res.redirect("/admin/Users");
            }
            const userExists = await User.findById(userId);
            // console.log(userExists);
            if (!userExists) {
                // req.flash("error", "Invalid user details");
                return res.redirect("/admin/Users");
            }
            return res.render("profile", {
                userExists: userExists,
                success: req.flash("success"),
                error: req.flash("error"),
            })
        } catch (error) {
            //console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    },

    Booking: async (req, res) => {
        try {

            const bookings = await Booking.find().sort({ createdAt: -1 })
                .populate('userId', 'name phone email')
                .populate('serviceProviderId')
                .populate('date')
                .populate({
                    path: 'timeId',
                    select: 'time',
                })
                .populate('categoryId');
            // console.log(bookings);
            return res.render("booking", {
                allBooking: bookings,

                success: req.flash("success"),
                error: req.flash("error"),
            });
        } catch (error) {
            //console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    },
    oneBooking: async (req, res) => {
        try {
            const bookingId = req.params.bookingId;

            const booking = await Booking.findById(bookingId)
                .populate('userId', 'name email phone')
                .populate('serviceProviderId', 'name email phone')
                .populate('date', 'date')
                .populate('categoryId', 'name')
                .populate('serviceId');

            if (!booking) {
                req.flash("error", "Booking not found");
                return res.redirect("/admin/bookings");
            }
            return res.render("viewBooking", {
                User: booking.userId,
                Booking: booking,
                ServiceProvider: booking.serviceProviderId,
                Date: booking.date,
                Time: booking.time,
                Category: booking.categoryId,
                Status: booking.status,
                PaymentStatus: booking.paymentStatus,
            });
        } catch (error) {
            console.error("Error fetching booking details:", error.message);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    },

    update_profile: async (req, res) => {
        try {
            console.log(req.body)
            const userId = req.params.id;
            const { name, email, phone } = req.body;
            const profilePicture = req.files ? req.files.profilePicture : null;


            const user = await User.findById(userId);
            if (!user) {
                req.flash("error", "Invalid user details");
                return res.redirect("/admin/profile");
            }


            if (user.email !== email) {
                const emailExists = await User.findOne({ email });
                if (emailExists) {
                    req.flash("error", "Email already registered");
                    return res.redirect("/admin/profile");
                }
                user.email = email;
            }

            if (user.phone != phone) {
                const phoneExists = await User.findOne({ phone });
                if (phoneExists) {
                    req.flash("error", "Phone number already exists");
                    return res.redirect("/admin/profile");
                }
                user.phone = phone;
            }


            if (profilePicture) {
                const allowedExtensions = ["jpg", "jpeg", "png", "gif"];
                const originalExtension = profilePicture.name.split(".").pop().toLowerCase();

                if (!allowedExtensions.includes(originalExtension)) {
                    req.flash("error", "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.");
                    return res.redirect("/admin/profile");
                }


                if (user.photo) {
                    const oldKey = user.photo.split("/").slice(-2).join("/");
                    const deleteParams = {
                        Bucket: "yaarish",
                        Key: oldKey,
                    };
                    await s3.deleteObject(deleteParams).promise();
                }


                const timestamp = Date.now();
                const safeFileName = profilePicture.name.replace(/[^a-zA-Z0-9]/g, "_");
                const filename = `profilePictures/${timestamp}_${safeFileName}`;

                const uploadParams = {
                    Bucket: "yaarish",
                    Key: filename,
                    Body: profilePicture.data,
                    ContentType: profilePicture.mimetype,
                };

                const s3Response = await s3.upload(uploadParams).promise();
                user.photo = s3Response.Location;
            }


            if (name) user.name = name;


            user.updatedAt = new Date();
            await user.save();

            req.flash("success", "Profile updated successfully");
            return res.redirect(`/admin/profile`);
        } catch (error) {
            console.error("Error in update_profile:", error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/profile");
        }
    },
    Admin: async (req, res) => {
        try {
            const sessionEmail = req.session.admin.email;
            const users = await User.find({ role: 'admin', email: { $ne: sessionEmail } }).sort({ createdAt: -1 });
            // //console.log(users)

            return res.render("Admin", {
                allUser: users,
                success: req.flash("success"),
                error: req.flash("error"),
            });
        } catch (error) {
            //console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    },

    storeAdmin: async (req, res) => {
        try {
            await body('name')
                .notEmpty().withMessage('Name is required')
                .isLength({ min: 3 }).withMessage('Name must be at least 4 characters long')
                .run(req);

            await body('email')
                .notEmpty().withMessage('Email is required')
                .isEmail().withMessage('Valid email is required')
                .run(req);

            await body('phone')
                .notEmpty().withMessage('Phone Number is required')
                .matches(/^[6-9]\d{9}$/).withMessage('Phone Number must be a valid 10-digit Indian number starting with 6-9')
                .run(req);

            await body('password')
                .notEmpty().withMessage('Password is required')
                .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
                .matches(/[A-Z]/).withMessage('Password must include at least one uppercase letter')
                .matches(/[0-9]/).withMessage('Password must include at least one number')
                .matches(/[@$!%*?&#]/).withMessage('Password must include at least one special character')
                .run(req);


            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                req.flash('error', errors.array().map(err => err.msg).join(', '));
                return res.redirect('/admin/Admin');
            }

            const { name, email, phone, password } = req.body;


            if (!name || !email || !phone || !password) {
                req.flash('error', 'All fields are required');
                return res.redirect('/admin/Admin');
            }


            const existingUser = await User.findOne({ email, phone });
            if (existingUser) {
                req.flash('error', 'Admin with this email already exists');
                req.flash('error', 'Admin with this phone number already exists');
                return res.redirect('/admin/Admin');
            }

            const hashedPassword = await bcrypt.hash(password, 10);


            const newAdmin = new User({
                name,
                email,
                phone,
                password: hashedPassword,
                role: 'admin',
            });


            await newAdmin.save();

            req.flash('success', 'New admin added successfully');
            return res.redirect('/admin/Admin');
        } catch (error) {
            console.log(error);
            req.flash('error', 'Internal server error');
            return res.redirect('/admin/Admin');
        }
    },



    oneAdmin: async (req, res) => {
        try {
            const userId = req.params.id;


            const admin = await User.findById(userId)
                // .select('name email phone')
                .populate('role')
            // .populate({
            //     path: 'permissions',
            //     select: 'module accessLevel',
            // });

            if (!admin) {
                req.flash("error", "Admin not found");
                return res.redirect("/admin/admins");
            }

            // Fetch admin activities
            // const adminActivities = await ActivityLog.find({ userId: userId })
            //     .populate('actionType')
            //     .populate('target');

            // Render the view with the admin's basic details and activities
            return res.render("viewadmin", {
                Admin: admin,
                success: req.flash("success"),
                error: req.flash("error"),
                // activities: adminActivities,
            });
        } catch (error) {
            console.error(error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    }
    ,

    User: async (req, res) => {
        try {
            const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
            // //console.log(users)

            return res.render("User", {
                allUser: users,
                success: req.flash("success"),
                error: req.flash("error"),
            });
        } catch (error) {
            //console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    },

    allUsers: async (req, res) => {
        try {
            const users = await User.find({ role: { $in: ['user', 'service_provider'] } }).sort({ createdAt: -1 });
            // console.log(users)
            return res.render("allUsers", {
                allUser: users,
                success: req.flash("success"),
                error: req.flash("error"),
            });
        } catch (error) {
            //console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    },


    oneUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId)
                .populate('country_id')
                .populate({
                    path: 'address',
                    select: 'address latitude longitude',
                })
                .populate('referralCode');
            // console.log(user.address)
            const bookings = await Booking.find({ userId: userId }).populate('serviceProviderId').populate('date').populate('time').populate('categoryId')

            // console.log(user);
            if (!user) {
                req.flash("error", "User not found");
                return res.redirect("/admin/User");
            }
            return res.render("viewuser", {
                User: user,
                bookings: bookings,
            });
        }
        catch (error) {
            //console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    },
    updateUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const { status } = req.body;
            const userExists = await User.findById(userId);
            if (!userExists) {
                req.flash("error", "User not found");
                return res.redirect("/admin/allusers");
            }
            userExists.status = status;
            await userExists.save();
            req.flash("success", "User updated successfully");
            return res.redirect(`/admin/User/${userId}`);
        } catch (error) {
            console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/allusers");
        }
    },

    updateServiceProvider: async (req, res) => {
        try {
            const userId = req.params.id;
            const { status } = req.body;
            console.log(status)
            const userExists = await User.findById(userId);
            if (!userExists) {
                req.flash("error", "service Provider not found");
                return res.redirect(`/admin/ServiceProvider/${userId}`);
            }
            userExists.status = status;
            await userExists.save();
            req.flash("success", "service Provider updated successfully");
            return res.redirect(`/admin/ServiceProvider/${userId}`);
        } catch (error) {
            console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    },

    service_provider: async (req, res) => {
        try {
            const service_provider = await User.find({ role: 'service_provider' }).sort({ createdAt: -1 });
            return res.render("serviceProvider", {
                allUser: service_provider,
                success: req.flash("success"),
                error: req.flash("error"),
            });
        } catch (error) {
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    },
    oneServiceProvider: async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId)
                .populate('aadhar_no')
                .populate('drivers_license_no')
                .populate('passport_no')
                .populate({
                    path: 'address',
                    select: 'address latitude longitude',
                });


            // console.log(user)
            if (!user) {
                req.flash("error", "User not found");
                return res.redirect("/admin/User");
            }

            const bookings = await Booking.find({ serviceProviderId: userId })
                .populate('userId')
                .populate('date')
                .populate('time')
                .populate('categoryId');

            const selectedCategories = await SelectedCategories.findOne({ userId })
                .populate({
                    path: 'categoryIds',
                    select: 'name icon',
                });


            const categoryNames = selectedCategories ? selectedCategories.categoryIds.map(category => category.name) : [];
            const categoryIcons = selectedCategories ? selectedCategories.categoryIds.map(category => category.icon) : [];
            return res.render("viewServiceProvider", {
                ServiceProvider: user,
                bookings: bookings,
                categoryNames: categoryNames,
                categoryIcons: categoryIcons,
                success: req.flash("success"),
                error: req.flash("error"),
            });
        } catch (error) {
            console.log(error)
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    }
    ,


    updateAdmin: async (req, res) => {
        try {
            const userId = req.params.id;
            const updateData = req.body;
            const user = await User.findOneAndUpdate(
                { _id: userId, role: 'admin' },
                updateData,
                { new: true }
            );

            if (!user) {
                req.flash("error", "Admin not found");
                return res.redirect("/admin/Admin");
            }

            req.flash("success", "Admin updated successfully");
            return res.redirect(`/admin/Admin/${userId}`);
        } catch (error) {
            //console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/Admin");
        }
    },

    deleteAdmin: async (req, res) => {
        try {
            const userId = req.params.id;

            const user = await User.findOneAndDelete({ _id: userId, role: 'admin' });

            if (!user) {
                req.flash("error", "Admin not found");
                return res.redirect("/admin/Admin");
            }

            req.flash("success", "Admin deleted successfully");
            return res.redirect("/admin/Admin");
        } catch (error) {
            //console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/Admin");
        }
    },

    // updateUser: async (req, res) => {
    //     try {
    //         const userId = req.params.id;
    //         const updateData = req.body;

    //         const user = await User.findOneAndUpdate(
    //             { _id: userId, role: 'user' },
    //             updateData,
    //             { new: true }
    //         );

    //         if (!user) {
    //             req.flash("error", "User not found");
    //             return res.redirect("/admin/User");
    //         }

    //         req.flash("success", "User updated successfully");
    //         return res.redirect("/admin/User");
    //     } catch (error) {
    //         //console.log(error);
    //         req.flash("error", "Internal server error");
    //         return res.redirect("/admin/User");
    //     }
    // },

    // deleteUser: async (req, res) => {
    //     try {
    //         const userId = req.params.id;

    //         const user = await User.findOneAndDelete({ _id: userId, role: 'user' });

    //         if (!user) {
    //             req.flash("error", "User not found");
    //             return res.redirect("/admin/User");
    //         }

    //         req.flash("success", "User deleted successfully");
    //         return res.redirect("/admin/User");
    //     } catch (error) {
    //         //console.log(error);
    //         req.flash("error", "Internal server error");
    //         return res.redirect("/admin/User");
    //     }
    // },

    // updateServiceProvider: async (req, res) => {
    //     try {
    //         const userId = req.params.id;
    //         const updateData = req.body;

    //         const user = await User.findOneAndUpdate(
    //             { _id: userId, role: 'service_provider' },
    //             updateData,
    //             { new: true }
    //         );

    //         if (!user) {
    //             req.flash("error", "Service Provider not found");
    //             return res.redirect("/admin/ServiceProvider");
    //         }

    //         req.flash("success", "Service Provider updated successfully");
    //         return res.redirect(`/admin/ServiceProvider`);
    //     } catch (error) {
    //         //console.log(error);
    //         req.flash("error", "Internal server error");
    //         return res.redirect("/admin/ServiceProvider");
    //     }
    // },

    // deleteServiceProvider: async (req, res) => {
    //     try {
    //         const userId = req.params.id;

    //         const user = await User.findOneAndDelete({ _id: userId, role: 'service_provider' });

    //         if (!user) {
    //             req.flash("error", "Service Provider not found");
    //             return res.redirect("/admin/ServiceProvider");
    //         }

    //         req.flash("success", "Service Provider deleted successfully");
    //         return res.redirect("/admin/ServiceProvider");
    //     } catch (error) {
    //         //console.log(error);
    //         req.flash("error", "Internal server error");
    //         return res.redirect("/admin/ServiceProvider");
    //     }
    // },



    // updateMovieTheater: async (req, res) => {
    //     try {
    //         const userId = req.params.id;
    //         const updateData = req.body;

    //         const user = await User.findOneAndUpdate(
    //             { _id: userId, role: 'movie_theater' },
    //             updateData,
    //             { new: true }
    //         );

    //         if (!user) {
    //             req.flash("error", "Movie Theater not found");
    //             return res.redirect("/admin/movieTheater");
    //         }

    //         req.flash("success", "Movie Theater updated successfully");
    //         return res.redirect("/admin/movieTheater");
    //     } catch (error) {
    //         //console.log(error);
    //         req.flash("error", "Internal server error");
    //         return res.redirect("/admin/movieTheater");
    //     }
    // },

    // deleteMovieTheater: async (req, res) => {
    //     try {
    //         const userId = req.params.id;

    //         const user = await User.findOneAndDelete({ _id: userId, role: 'movie_theater' });

    //         if (!user) {
    //             req.flash("error", "Movie Theater not found");
    //             return res.redirect("/admin/movieTheater");
    //         }

    //         req.flash("success", "Movie Theater deleted successfully");
    //         return res.redirect("/admin/movieTheater");
    //     } catch (error) {
    //         //console.log(error);
    //         req.flash("error", "Internal server error");
    //         return res.redirect("/admin/movieTheater");
    //     }
    // },


}