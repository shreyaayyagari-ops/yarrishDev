const MovieTheater = require('../../Models/beatTheBox/movieTheater.js');
const mongoose = require('mongoose');
// const MovieDetails = require('../../Models/beatTheBox/movieDetails.js');
// const BankDetails = require('../../Models/beatTheBox/bankDetails.js');
const { body, validationResult } = require('express-validator');
const otpStore = []
const otpCache = new Map();
const { uploadFile, deleteFile } = require("../../middleware/awsMiddleware.js");
const { sendOtp } = require('../../middleware/LoginMiddleware.js');
const jwt = require("jsonwebtoken");
const { generateToken } = require("../../middleware/theaterMiddleWare.js");
const City = require('../../Models/beatTheBox/city.js');
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer'); const { generateRandomPassword } = require('../../middleware/LoginMiddleware.js');
const { sendMailCredentials } = require('../../middleware/LoginMiddleware.js');
const path = require("path");
const AWS = require("aws-sdk");

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();


module.exports = {


    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            // console.log(email, password);
            if (!email || !password) {
                return res.status(400).json({ message: "Invalid email and password" });
            }
            const theaterExists = await MovieTheater.findOne({ email: email });
            if (!theaterExists) {
                return res.status(400).json({ message: "Invalid theater details" });
            }
            const isPassordMatched = await theaterExists.matchPassword(password);
            if (!isPassordMatched) {
                return res.status(400).json({ message: "Password is wrong" });
            }
            req.session.theater = theaterExists;


            return res.status(200).json({ message: "Login successful", token: generateToken(theaterExists._id), screen_status: theaterExists.screen_status, movieTheaterName: theaterExists.movieTheaterName });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },



    register_movie: async (req, res) => {
        try {
            const { Movie_theater_name, email_id, phone_number, Executive, fcm_token } = req.body;

            const existingUser = await MovieTheater.findOne({ email_id });
            if (existingUser) {
                return res.status(400).json({ message: 'Movie theater already registered with this email ID.' });
            }
            const generatedPassword = await generateRandomPassword();
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);
            const newMovieTheater = new MovieTheater({
                Movie_theater_name,
                email_id,
                phone_number,
                password: hashedPassword,
                role: 'movie_theater',
                Executive,
                fcm_token: Array.isArray(fcm_token) ? fcm_token : [fcm_token],
            });
            await newMovieTheater.save();
            await sendMailCredentials(email_id, Movie_theater_name, generatedPassword);
            res.status(201).json({ message: 'Movie theater registered successfully.' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    change_Password_otp: async (req, res) => {
        try {
            const { email_id } = req.body;
            if (!email_id) {
                return res.status(400).json({ message: "Email is required." });
            }

            const userExists = await MovieTheater.findOne({ email_id });
            if (!userExists) {
                return res.status(404).json({ message: "User not found" });
            }

            const otpSent = await sendOtp(req, res);
            if (!otpSent) {
                return res.status(429).json({ message: "otp sent" });
            }

            const otpCache = {
                otp: otpStore['otp'],
                time: Date.now()
            };
            otpStore[email_id] = otpCache;

            return res.status(200).json({ message: "OTP sent successfully." });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    ,

    verify_otp_movie: async (req, res) => {
        try {

            await body('otp')
                .notEmpty().withMessage('OTP is required')
                .run(req);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            if (!req.headers.authorization) {
                return res.status(401).json({ error: 'Authorization header missing' });
            }
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const movieTheaterId = decoded.id;
            if (!mongoose.Types.ObjectId.isValid(movieTheaterId)) {
                return res.status(400).json({ error: 'Invalid user ID' });
            }
            const Movie = await MovieTheater.findById(movieTheaterId);
            if (!Movie) {
                return res.status(404).json({ error: 'Movie not found' });
            }
            const otp = Movie.otp;
            // if (!otp) {
            //     return res.status(400).json({ error: 'OTP not found' });
            // }
            // if (otp !== req.body.otp) {
            //     return res.status(400).json({ error: 'Invalid OTP' });
            // }
            // const { fcm_token } = req.body;
            // if (fcm_token && Array.isArray(fcm_token)) {
            //     user.fcm_token = fcm_token;
            //     await user.save();
            // } else if (fcm_token) {
            //     user.fcm_token = [fcm_token];
            //     await user.save();
            // }
            Movie.otp_status = 'Verified';
            await Movie.save();
            return res.status(200).json({
                message: "OTP Verified",
                userName: Movie.name,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    change_password: async (req, res) => {
        try {
            const { newPassword, re_enterNewPassword } = req.body;

            if (!newPassword || !re_enterNewPassword) {
                return res.status(400).json({ message: "Both password fields are required." });
            }
            if (newPassword !== re_enterNewPassword) {
                return res.status(400).json({ message: "Passwords do not match." });
            }
            const movieTheaterId = req.movie.id;
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await MovieTheater.updateOne({ _id: movieTheaterId }, { password: hashedPassword });
            return res.status(200).json({ message: "Password updated successfully." });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },



    movie_Details: async (req, res) => {
        try {
            const movieTheaterId = req.movieTheaterId;
            const existingMovieTheater = await MovieTheater.findById(movieTheaterId);
            if (!existingMovieTheater) {
                return res.status(404).json({ message: "Movie Theater not found." });
            }
            const { movieTheaterName, location, Area, Address, latitude, longitude } = req.body;
            const theaterLogo = req.files ? req.files.theaterLogo : null;
            if ( !movieTheaterName ||!location || !Area || !Address || !latitude || !longitude) {
                return res.status(400).json({ message: "Missing required fields." });
            }
            const cityDetails = await City.findById(location);
        if (!cityDetails) {
            return res.status(404).json({ message: "City not found." });
        }
            if (!theaterLogo) {
                return res.status(400).json({ message: 'Invalid image' })
            }
            const logo = await uploadFile(theaterLogo, "yaarish", "MovieDetails");
            if (!logo) {
                return res.status(400).json({ meesage: "Invalid Logo" })
            }
            existingMovieTheater.movieTheaterName = movieTheaterName;
            existingMovieTheater.location = location;
            existingMovieTheater.cityName = cityDetails.cityName;
            existingMovieTheater.Area = Area;
            existingMovieTheater.Address = Address;
            existingMovieTheater.latitude = latitude;
            existingMovieTheater.longitude = longitude;
            existingMovieTheater.theaterLogo = logo;
            existingMovieTheater.screen_status = "BankDetails";
            await existingMovieTheater.save();
            res.status(201).json({
                message: "Movie details created successfully!",
                screen_status: existingMovieTheater.screen_status,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    bank_Details: async (req, res) => {
        try {
            const movieTheaterId = req.movieTheaterId;

            const existingMovieTheater = await MovieTheater.findById(movieTheaterId);
            if (!existingMovieTheater) {
                return res.status(404).json({ message: "Movie Theater not found" });
            }

            const { bankName, accountNumber, accountType, Branch, IFSC_code } = req.body;
            if (!bankName || !accountNumber || !accountType || !Branch || !IFSC_code) {
                return res.status(400).json({ message: 'Missing required bank details fields' });
            }
            existingMovieTheater.bankName = bankName;
            existingMovieTheater.accountNumber = accountNumber;
            existingMovieTheater.accountType = accountType;
            existingMovieTheater.Branch = Branch;
            existingMovieTheater.IFSC_code = IFSC_code;
            existingMovieTheater.screen_status = "VerificationCompleted";
            await existingMovieTheater.save();

            res.status(201).json({
                message: 'Bank details created successfully!',
                screen_status: existingMovieTheater.screen_status,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    Profile: async (req, res) => {
        try {
            const movieTheaterId = req.movieTheaterId;
            const existingMovieTheater = await MovieTheater.findById(movieTheaterId);
            if (!existingMovieTheater) {
                return res.status(404).json({ message: 'Movie theater not found' });
            }
            res.status(200).json({
                message: 'Successfully fetched profile of movie theater',
                Profile: existingMovieTheater,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const movieTheaterId = req.movieTheaterId;
            const existingMovieTheater = await MovieTheater.findById(movieTheaterId);
            const theaterLogo = req.files ? req.files.theaterLogo : null;
            if (!existingMovieTheater) {
                return res.status(404).json({ message: 'Movie theater not found' });
            }
            if (location) {
                const cityDetails = await City.findById(location);
                if (!cityDetails) {
                    return res.status(404).json({ message: 'City not found' });
                }
                existingMovieTheater.location = location;
                existingMovieTheater.cityName = cityDetails.cityName; 
            }
            const logo = await uploadFile(theaterLogo, "yaarish", "MovieDetails");
            const { location, Area, Address, latitude, longitude } = req.body;
            existingMovieTheater.location = location || existingMovieTheater.location;
            existingMovieTheater.Area = Area || existingMovieTheater.Area;
            existingMovieTheater.Address = Address || existingMovieTheater.Address;
            existingMovieTheater.latitude = latitude || existingMovieTheater.latitude;
            existingMovieTheater.longitude = longitude || existingMovieTheater.longitude;
            existingMovieTheater.theaterLogo = logo;
            await existingMovieTheater.save();
            return res.status(200).json({
                message: 'Profile updated successfully',
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    getMovieDetails: async (req, res) => {
        try{
            const movieDetails = await MovieTheater.find({status: 'Active'}).sort({createdAt: -1});
            if(!movieDetails){
                return res.status(404).json({message: 'No movie details found'});
            }

         } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    






};


