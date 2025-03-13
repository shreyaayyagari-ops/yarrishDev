const User = require('../../Models/userModel');
const saltRounds = 10;
const bcrypt = require('bcrypt');
const dotenv = require("dotenv").config();
const axios = require('axios');
const Country = require('../../Models/Country');
const Address = require('../../Models/address.js');
const { generateToken, isAuthenticated, isAdmin, isUnAuthenticated, validPhoneNumber, isValidPassword, validEmail } = require('../../middleware/authMiddleware');
const Settings = require('../../Models/settings.js');
const sendEmailOTP = require('../../middleware/emailandotpMiddleware.js');
const { body, validationResult } = require('express-validator');
const termsAndConditions = require('../../Models/settings');
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
const { uploadFile, deleteFile } = require("../../middleware/awsMiddleware.js");
const SelectedCategory = require('../../Models/selectedCategory.js');
const { sendOTP } = require('../../middleware/smsotp.js');
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);
// const { body } = require('express-validator');
const mongoose = require('mongoose');
const AWS = require('aws-sdk');

// var serviceAccount = require('../fcm2.json');

const { sendGmail } = require('../../middleware/sendMail.js');

AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION
});
const s3 = new AWS.S3();

let otpstore = [];

const isGeneratedOtp = () => Math.floor(100000 + Math.random() * 900000);

module.exports = {

	addCountry: async (req, res) => {
		try {
			const { name, code, } = req.body;
			const icon = req.files ? req.files.icon : null;
			if (!name || !code) {
				return res.status(400).json({ message: 'Name and code are required' });
			}
			if (!icon) {
				return res.status(400).json({ message: 'Icon is required' });
			}
			const icon_path = await uploadFile(icon, "yaarish", "Country");
			if (!icon_path) {
				return res.status(400).json({ message: 'Invalid icon' });
			}
			const country = await Country.create({ name, code, icon: icon_path });
			return res.status(201).json({ message: "Country added successfully", country });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });

		}
	},

	get_country: async (req, res) => {
		try {
			const countries = await Country.find({ status: 'Active' }).select(['name', 'icon', 'code']);
			if (!countries || countries.length === 0) {
				return res.status(400).json({ error: 'No Country Found' });
			}
			for (const country of countries) {
				country.icon = country.icon_path;
			}
			return res.status(200).json({ countries: countries });
		} catch (error) {
			console.error('Error fetching countries:', error.message);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	},


	register: async (req, res) => {
		try {
			await body('name')
				.notEmpty().withMessage('Name is required')
				.isLength({ min: 3, max: 20 }).withMessage('Name must be between 3 and 20 characters long')
				.matches(/^[A-Za-z\s]+$/).withMessage('Name must contain only alphabets and spaces')
				.run(req);
			await body('email')
				.notEmpty().withMessage('Email is required')
				.isLength({ max: 254 }).withMessage('Email must not exceed 254 characters')
				.matches(/^[^+][a-zA-Z0-9._%+-]+@gmail\.com$/).withMessage('Invalid email format') // Updated regex
				.run(req);
			await body('phone')
				.notEmpty().withMessage('Phone number is required')
				.bail() 
				.custom((value) => {
					if (!/^[6-9]\d{9}$/.test(value)) {
						throw new Error('Phone number must be atleast 10 digits and start with 6-9');
					}
					return true;
				})
				.run(req);
				await body('referralCode')
			.optional({ checkFalsy: true })
			.custom(async (value) => {
				if (value) {
					const userWithReferral = await User.findOne({ referralCode: value });
					if (!userWithReferral) {
						throw new Error('Invalid referral code');
					}
				}
				return true;
			})
			.run(req);
			await body('role')
				.notEmpty().withMessage('Role is required')
				.isIn(['user', 'service_provider', 'admin']).withMessage('Role must be user, service_provider, or admin')
				.run(req);
			await body('country_id')
				.optional({ checkFalsy: true })
				.custom(async (value, { req }) => {
					if (value && !mongoose.isValidObjectId(value)) {
						throw new Error('Invalid Country Id format');
					}

					const country = await Country.findById(value);
					if (value && !country) {
						throw new Error('The specified Country Id does not exist');
					}

					return true;
				})
				.run(req);
			await body('referralCode')
				.optional({ checkFalsy: true })
				.custom(async (value) => {
					const userWithReferral = await User.findOne({ referralCode: value });
					if (!userWithReferral) {
						throw new Error('Invalid referral code');
					}
					return true;
				})
				.run(req);
				const errors = validationResult(req);
				if (!errors.isEmpty()) {
					const firstError = errors.array()[0]; 
				
					return res.status(400).json({ 
						type: "field",
						value: firstError.value,
						msg: firstError.msg,
						path: firstError.path,
						location: "body"
					});
			}
			const { role, name, email, phone, password, country_id, fcm_token, referralCode } = req.body;
			if (!role || !name || !email || !phone || !country_id) {
				return res.status(400).json({ message: "All fields are required" });
			}			
			const userExistsByEmail = await User.findOne({ email: email });
			const userExistsByPhone = await User.findOne({ phone: phone });
			const countryIdExists = await Country.findById(country_id);

			if (!countryIdExists) {
				return res.status(400).json({ message: "Invalid country details" });
			}
			const userExists = await User.findOne({ email: email, phone: phone });
			if (userExists) {
				return res.status(400).json({ message: "User already exists with this email and phone number" });
			}
			if (userExistsByEmail) {
				return res.status(400).json({ message: "Email already existed" });
			} else if (userExistsByPhone) {
				return res.status(400).json({ message: "Phone number already existed" });
			} else {
				const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
				const generatedOtp = isGeneratedOtp();
				if (countryIdExists.code !== "+91") {
					const mailSent = await sendGmail(email, generatedOtp);
					if (!mailSent) {
						return res.status(400).json({ success: false, message: "Failed to send OTP" });
					}
				} else {
					const sendingOtpToMobile = await sendOTP(phone, generatedOtp);
					if (!sendingOtpToMobile) {
						return res.status(400).json({ success: false, message: "Failed to send OTP" });
					}
				}
				const expirationTime = 10 * 60 * 1000;
				const newUser = await User.create({
					role, name, email, phone, country_id, otp_expiry: new Date(Date.now() + expirationTime),
					otp: generatedOtp, status: 'Active', otp_status: 'Sent', fcm_token, referralCode, password: hashedPassword
				});
				if (role === 'service_provider') {
					const referralCode = `REF-${newUser._id.toString().toUpperCase()}`;
					newUser.referralCode = referralCode;
					await newUser.save();
				}
				const token = generateToken(newUser._id);
				return res.status(200).json({
					message: "Registration Successful",
					token,
					userId: newUser._id,
				});
			}
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	}



	,
	proof_verification: async (req, res) => {
		try {
			const authHeader = req.headers.authorization;
			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				return res.status(401).json({ message: "Authorization token is missing or invalid" });
			}

			const token = authHeader.split(' ')[1];
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			const userId = decoded.id;

			const user = await User.findById(userId);
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			const { aadhar_no, passport_no, drivers_license_no } = req.body;

			if (aadhar_no) user.aadhar_no = aadhar_no;
			if (passport_no) user.passport_no = passport_no;
			if (drivers_license_no) user.drivers_license_no = drivers_license_no;

			if (!aadhar_no && !passport_no && !drivers_license_no) {
				return res.status(400).json({ message: "At least one proof is required" });
			}

			user.proofVerification = true;
			await user.save();

			return res.status(200).json({
				message: "Proof verification updated successfully",
				proofVerification: user.proofVerification,
				proofs: {
					aadhar_no: user.aadhar_no,
					passport_no: user.passport_no,
					drivers_license_no: user.drivers_license_no
				}
			});
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},
	getVerificationStatus: async (req, res) => {
		try {
			const serviceProviderId = req.userId
			const user = await User.findById(serviceProviderId);
			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}
			const status = {
				passport_status: user.passport_status,
				aadhar_status: user.aadhar_status,
				driving_license_status: user.driving_license_status,
				sp_authenticated: user.sp_authenticated,
				screen_status: user.screen_status
			};
			// console.log(status);
			return res.status(200).json({ status });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},


	login: async (req, res) => {
		try {
			const { phone, role, fcm_token } = req.body;
			const errors = [];
			if (!['user', 'service_provider', 'admin'].includes(role)) {
				errors.push({ msg: 'Role should be assigned' });
			}
			const phoneRegex = /^[6-9]\d{9}$/;
			const isForeignNumber = !phoneRegex.test(phone);
			if (!phone) {
				errors.push({ msg: 'Phone Number is required' });
			}
			if (errors.length > 0) {
				return res.status(400).json({ errors });
			}
			const userExists = await User.findOne({ phone });
			if (!userExists) {
				return res.status(404).json({ message: "User not found" });
			}
			if (userExists.status === "Inactive") {
				return res.status(403).json({ message: "User account is inactive" });
			}
			let address;
			const addressExists = await Address.findOne({ userId: userExists._id });

			if (addressExists) {
				addressExists.status = false;
				address = await addressExists.save();
			} else {
				address = new Address({
					userId: userExists._id,
					status: true,
				});
				await address.save();
			}

			if (!userExists) {
				return res.status(404).json({ message: "User not found" });
			}
			if (userExists.role !== 'service_provider' && role === 'service_provider') {
				userExists.role = role;
				await userExists.save();
			}
			if (fcm_token && Array.isArray(fcm_token)) {
				userExists.fcm_token = fcm_token;
				await userExists.save();
			} else if (fcm_token) {
				userExists.fcm_token = [fcm_token];
				await userExists.save();
			}
			if (isForeignNumber) {
				if (!userExists.email) {
					return res.status(400).json({ message: "No email associated with this phone number" });
				}

				// Generate the OTP
				const otp = generateOTP();
				console.log("Generated OTP:", otp);
				const emailSent = await sendEmailOTP(userExists.email, otp);

				if (!emailSent) {
					return res.status(500).json({ message: "Failed to send OTP to email" });
				}

				userExists.otp = otp;
				userExists.otp_status = 'Pending';
				await userExists.save();

				return res.status(200).json({
					message: "OTP sent. Please verify to complete login",
					userName: userExists.name,
					userId: userExists._id,
					address: address.status
				});
			} else {
				// Generate the OTP
				const otp = generateOTP();
				console.log("Generated OTP:", otp);

				const otpSent = await sendOTP(phone, otp);

				if (!otpSent) {
					return res.status(500).json({ message: "Failed to send OTP to phone number" });
				}

				userExists.otp = otp;
				userExists.otp_status = 'Pending';
				await userExists.save();

				return res.status(200).json({
					message: "OTP sent. Please verify to complete login",
					userName: userExists.name,
					userId: userExists._id,
					address: address.status
				});
			}

		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	}

	,
	verify_login_otp: async (req, res) => {
		try {
			const { otp, phone, fcm_token } = req.body;
			console.log(otp, phone);

			const user = await User.findOne({ phone });

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			if (user.otp !== otp) {
				return res.status(400).json({ message: "Invalid OTP" });
			}

			if (fcm_token && Array.isArray(fcm_token)) {
				user.fcm_token = fcm_token;
				await user.save();
			} else if (fcm_token) {
				user.fcm_token = [fcm_token];
				await user.save();
			}

			const userName = user.name;
			const token = generateToken(user._id, user.role);
			user.authToken = token;

			if (
				user.selectServices &&
				user.selectLocation &&
				user.selectSubscription &&
				user.proofVerification
			) {
				user.sp_authenticated = true;
			} else {
				user.sp_authenticated = false;
			}

			await user.save(); // Save the updated user object

			return res.status(200).json({
				message: "Login successful",
				token,
				userName,
				sp_authenticated: user.sp_authenticated, // Send updated sp_authenticated status
			});
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	}
	,

	create_password: async (req, res) => {
		try {
			await body('password')
				.notEmpty().withMessage('Password is required')
				.isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
				.run(req);

			await body('userId')
				.notEmpty().withMessage('User ID is required')
				.isMongoId().withMessage('Invalid User ID')
				.run(req);

			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { password, userId } = req.body;


			const user = await User.findById(userId);
			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}

			const userName = user.name

			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);
			user.password = hashedPassword;
			await user.save();

			const token = jwt.sign(
				{ id: user._id },
				process.env.JWT_SECRET,
				{ expiresIn: '60d' }
			);

			//console.log("user.password", user.password);
			return res.status(200).json({ message: 'Password created successfully', token, userName })
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},


	// forget_password: async (req, res) => {

	// 	await body('email')
	// 		.notEmpty().withMessage('Email is required')
	// 		.isEmail().withMessage('Invalid email format')
	// 		.run(req);


	// 	const errors = validationResult(req);
	// 	if (!errors.isEmpty()) {
	// 		return res.status(400).json({ errors: errors.array() });
	// 	}

	// 	const user = await User.findOne({ email: req.body.email });
	// 	if (user) {
	// 		// Generate a random 4-digit OTP
	// 		///user.otp = Math.floor(1000 + Math.random() * 9000); 
	// 		user.otp = 1234;
	// 		user.otp_status = 'Sent';
	// 		await user.save();

	// 		const mailSent = await sendMail(user.email, user.otp);
	// 		if (!mailSent) {
	// 			req.flash("error", "Error while sending mail, please try again later.");
	// 			return res.status(500).json({ msg: 'Error while sending OTP email' });
	// 		}

	// 		return res.status(200).json({ msg: 'OTP sent to your email address, please check' });
	// 	} else {
	// 		return res.status(400).json({ msg: 'User not found' });
	// 	}
	// },

	// reset_password: async (req, res) => {
	// 	await body('email')
	// 		.optional()
	// 		.isEmail().withMessage('Valid email is required')
	// 		.run(req);

	// 	await body('phone')
	// 		.optional()
	// 		.matches(/^[6-9]\d{9}$/).withMessage('Phone Number must be a valid 10-digit Indian number starting with 6-9')
	// 		.run(req);

	// 	await body('password')
	// 		.notEmpty().withMessage('Password is required')
	// 		.isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
	// 		.run(req);
	// 	await body().custom((value, { req }) => {
	// 		if (!req.body.email && !req.body.phone) {
	// 			throw new Error('At least one of email or phone is required');
	// 		}
	// 		return true;
	// 	}).run(req)


	// 	const errors = validationResult(req);

	// 	if (!errors.isEmpty()) {
	// 		return res.status(400).json({ errors: errors.array() });
	// 	}
	// 	const user = await User.findOne({ $or: [{ email: req.body.email }, { phone: req.body.phone }] });
	// 	if (!user) {
	// 		return res.status(400).json({ msg: 'User not found' });
	// 	}
	// 	if (req.body.otp == user.otp) {
	// 		user.password = req.body.password;
	// 		user.otp = '';
	// 		await user.save();
	// 		return res.status(200).json({ msg: 'Password updated' });
	// 	} else {
	// 		return res.status(400).json({ msg: 'Invalid Otp' });
	// 	}
	// },

	verify_otp: async (req, res) => {
		try {
			await body('otp')
				.notEmpty().withMessage('OTP is required')
				.run(req);
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}
			const { fcm_token, otp } = req.body;
			const userId = req.userId;
			if (!mongoose.Types.ObjectId.isValid(userId)) {
				return res.status(400).json({ error: 'Invalid user ID' });
			}
			const user = await User.findById(userId);
			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}
			if (!user.otp) {
				return res.status(400).json({ error: 'OTP not found' });
			}
			// if (Date.now() > new Date(user.otp_expiry).getTime()) {
			// 	return res.status(400).json({ error: 'OTP has expired' });
			// }
			if (user.otp !== otp) {
				return res.status(400).json({ error: 'Invalid OTP' });
			}
			if (fcm_token) {
				if (Array.isArray(fcm_token)) {
					user.fcm_token = fcm_token;
				} else {
					user.fcm_token = [fcm_token];
				}
				await user.save();
			}
			user.otp_status = 'Verified';
			user.otp_expiry = null;
			user.screen_status = "services";
			await user.save();
			return res.status(200).json({
				message: `OTP Verified Successfully`,
				userName: user.name,
				sp_authenticated: user.sp_authenticated,
				screen_status: user.screen_status
			});
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},

	resend_otp: async (req, res) => {
		try {
			const { phone } = req.body;
			const user = await User.findOne({ phone });
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}
			const countryIdExists = await Country.findById(user.country_id);
			if (!countryIdExists) {
				return res.status(404).json({ message: "Country not found" });
			}
			const generatedOtp = isGeneratedOtp();
			console.log(generatedOtp);
			if (countryIdExists.code !== "+91") {
				const mailSent = await sendGmail(user.email, generatedOtp);
				if (!mailSent) {
					return res.status(400).json({ success: false, message: "Failed to send OTP" });
				}
			} else {
				const sendingOtpToMobile = await sendOTP(phone, generatedOtp);
				if (!sendingOtpToMobile) {
					return res.status(400).json({ success: false, message: "Failed to send OTP" });
				}
			}
			const expirationTime = 10 * 60 * 1000;
			user.otp_expiry = new Date(Date.now() + expirationTime);
			user.otp = generatedOtp;
			user.otp_status = 'Sent';
			await user.save();
			return res.status(200).json({ message: "OTP Sent" });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},

	profile: async (req, res) => {
		try {
			const userId = req.userId
			const user = await User.findById(userId)
				.select('-otp -password -isAdmin')
				.populate('country_id', 'name');
			if (!user) {
				return res.status(404).json({ message: 'User not found' });
			}
			if (user.country_id) {
				user.country = `${user.country_id.name} (ID: ${user.country_id._id})`;
			} else {
				user.country = null;
			}
			return res.status(200).json({
				user: {
					...user.toObject(),
					referralCode: user.referralCode || null,
				},
			});
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},
	update_profile: async (req, res) => {
		try {
			const userId = req.userId
			const { name } = req.body;
			const photo = req.files ? req.files.photo : null;
			if (!userId) {
				return res.status(400).json({ status: 'fail', message: 'User ID is missing in the request parameters!' });
			}
			const user = await User.findById(userId);
			if (!user) {
				return res.status(404).json({ status: 'fail', message: 'User not found!' });
			}
			if (name) {
				user.name = name;
			}
			if (photo) {
				await deleteFile(user.photo, "yaarish", "profilePictures");
				const picturePicturePath = await uploadFile(photo, "yaarish", "profilePictures");
				user.photo = picturePicturePath;
			}
			await user.save();
			return res.status(200).json({
				status: 'success',
				message: 'Profile updated successfully!',
				// user,
			});
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},



	// change_role: async (req, res) => {
	// 	await body('role')
	// 		.notEmpty().withMessage('Role is required').bail()
	// 		.isIn(['user', 'service_provider']).withMessage('Role must be user, service_provider')
	// 		.run(req);

	// 	// Collect validation errors
	// 	const errors = validationResult(req);

	// 	if (!errors.isEmpty()) {
	// 		return res.status(400).json({ errors: errors.array() });
	// 	}

	// 	const user = await User.findById(req.user.id);
	// 	user.role = req.body.role;
	// 	await user.save();
	// 	return res.status(200).json({ 'message': 'User Role changed' });
	// },

	switchProfile: async (req, res) => {
		try {
			const user = await User.findById(req.user._id);
			if (!user) return res.status(404).json({ message: "User not found" });

			user.activeRole = user.activeRole === "user" ? "service_provider" : "user";
			await user.save();

			return res.status(200).json({
				message: `Profile switched to ${user.activeRole} successfully.`,
				activeRole: user.activeRole
			});
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},


	// getUserDashboard: async (req, res) => {
	// 	try {

	// 		return res.status(200).json({ message: "User Dashboard Data" });
	// 	} catch (error) {
	// 		return res.status(500).json({ message: "An error occurred while fetching user dashboard data", error });
	// 	}
	// },


	// getServiceProviderDashboard: async (req, res) => {
	// 	try {

	// 		return res.status(200).json({ message: "Service Provider Dashboard Data" });
	// 	} catch (error) {
	// 		return res.status(500).json({ message: "An error occurred while fetching service provider dashboard data", error });
	// 	}
	// },

	logout: async (req, res) => {
		try {
			const userId = req.userId

			await User.findByIdAndUpdate(userId, { authToken: null });

			req.session?.destroy((err) => {
				if (err) {
					console.error("Error destroying session:", err);
					return res.status(500).json({ message: "Failed to log out" });
				}
				res.status(200).json({ message: "Logged out successfully" });
			});
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	}
	,

	getPrivacyPolicy: async (req, res) => {
		try {
			const settings = await Settings.findOne({});
			if (!settings) {
				return res.status(404).json({ message: "Settings not found" });
			}
			const result = {
				userPrivacyPolicy: settings.userPrivacyPolicy,
				serviceProviderPrivacyPolicy: settings.serviceProviderPrivacyPolicy
			};
			return res.render('privacyPolicy', { result });

		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},


	getRefundPolicy: async (req, res) => {
		try {
			const settings = await Settings.findOne({});
			if (!settings) {
				return res.status(404).json({ message: "Settings not found" });
			}
			const result = {
				userRefundPolicy: settings.userRefundPolicy,
				serviceProviderRefundPolicy: settings.serviceProviderRefundPolicy
			};
			return res.render('RefundPolicy', { result });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},


	getTermsAndConditions: async (req, res) => {
		try {
			const settings = await Settings.findOne({});
			if (!settings) {
				return res.status(404).json({ message: "Settings not found" });
			}
			const result = {
				userTermsAndConditions: settings.userTermsAndConditions,
				serviceProviderTermsAndConditions: settings.serviceProviderTermsAndConditions
			};
			return res.render('TermsandConditions', { result });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},


	getAboutUs: async (req, res) => {
		try {
			const settings = await Settings.findOne({});
			if (!settings) {
				return res.status(404).json({ message: "Settings not found" });
			}
			const result = {
				userAboutUs: settings.userAboutUs,
				serviceProviderAboutUs: settings.serviceProviderAboutUs
			};
			return res.render('AboutApp', { result });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},

	HelpAndSupport: async (req, res) => {
		try {
			// const settings = await Settings.findOne({});
			// if (!settings) {
			// 	return res.status(404).json({ message: "Settings not found" });
			// }
			// const result = {
			// 	userAboutUs: settings.userAboutUs,
			// 	serviceProviderAboutUs: settings.serviceProviderAboutUs
			// };
			return res.render('helpandsupport');
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},

	DeleteAccountPolicy: async (req, res) => {
		try {
			// const settings = await Settings.findOne({});
			// if (!settings) {
			// 	return res.status(404).json({ message: "Settings not found" });
			// }
			// const result = {
			// 	userAboutUs: settings.userAboutUs,
			// 	serviceProviderAboutUs: settings.serviceProviderAboutUs
			// };
			return res.render('DeleteAccountPolicy');
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},

	Profiletoggle: async (req, res) => {
		try {
			const userId = req.userId;
			const user = await User.findById(userId);

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			const { confirmSwitch } = req.body;

			if (confirmSwitch === undefined) {
				return res.status(400).json({
					message: "Confirmation parameter 'confirmSwitch' is required to proceed with role switch.",
				});
			}

			if (!confirmSwitch) {
				return res.status(200).json({
					message: "Role switch canceled by user.",
					role: user.role,
					screen_status: user.screen_status,
				});
			}

			if (user.role === "user") {
				if (user.sp_authenticated) {
					if (user.screen_status === "dashboard") {
						user.role = "service_provider";
						await user.save();
						return res.status(200).json({
							message: "Role successfully updated to service_provider.",
							role: "service_provider",
							screen_status: user.screen_status,
						});
					} else {
						return res.status(400).json({
							message: "Cannot switch role to service_provider. Screen status must be 'dashboard'.",
							role: user.role,
							screen_status: user.screen_status,
						});
					}
				} else {
					return res.status(427).json({
						message: "Complete all onboarding steps before switching roles.",
						screen_status: user.screen_status,
					});
				}
			}

			if (user.role === "service_provider") {
				user.role = "user";
				await user.save();
				return res.status(200).json({
					message: "Role successfully updated to user.",
					role: "user",
				});
			}

			return res.status(400).json({ message: "Invalid role for switching." });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}



	,


	getSettings: async (req, res) => {
		try {

			const settings = await Settings.findOne();

			if (!settings) {
				return res.status(404).json({ message: 'Settings not found' });
			}

			res.status(200).json(settings);
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},


	getWalletBalance: async (req, res) => {
		try {
			const userId = req.userId
			const user = await User.findById(userId).select("wallet").exec();
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}
			res.status(200).json({ wallet: user.wallet });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	}





	//// steps: {
	// 	selectServices: user.selectServices,
	// 	selectLocation: user.selectLocation,
	// 	selectSubscription: user.selectSubscription,
	// 	proofVerification: user.proofVerification,
	// },

};