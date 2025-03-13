const bcrypt = require("bcryptjs");

const User = require("../../Models/userModel");
const { validPassword } = require('../../middleware/authMiddleware.js')
const sendOtp = require('../../middleware/LoginMiddleware');

const otpsend = require('../../middleware/otp');
const nodemailer = require('nodemailer');

isGeneratedOtp = () => {
    return Math.floor(1000 + Math.random() * 9000);
}
let otpStore = {}




const isValidEmail = async (email) => {
    const allowedDomains = ['gmail.com', 'yahoo.com', 'domain.com', 'domain.org', 'domain.ac.in', 'edu.in', 'gov.in', 'nic.in', 'institute.com']; // Add institute.com here
    // Updated regex to ensure only valid characters are allowed in the email local part
    const emailRegex = /^[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Updated regex to detect if email starts with any special characters, including a dot (.)
    const specialCharAtStartRegex = /^[!@#$%^&*()_+{}|:"<>?,./;'[\]\-=]/;
    // Regex to check if local part contains only special characters
    const specialCharOnlyRegex = /^[!@#$%^&*()_+{}|:"<>?,./;'[\]\-=]+$/;

    try {
        email = email.trim();

        // Check for lowercase letters
        if (email !== email.toLowerCase()) {
            throw new Error('Invalid email format. Please provide lowercase letters.');
        }

        // Check if the email starts with special characters
        if (specialCharAtStartRegex.test(email)) {
            throw new Error('Email should not start with special characters.');
        }

        // Check if the local part contains only special characters
        const [localPart, domainPart] = email.split('@');
        if (specialCharOnlyRegex.test(localPart)) {
            throw new Error('Email local part cannot consist only of special characters.');
        }

        // Check overall email format
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format.');
        }

        // Ensure the email is split properly
        if (!domainPart || domainPart.split('.').length < 2) {
            throw new Error('Invalid email format. It should be in domain@gmail.com format.');
        }

        // Relaxed domain part validation to allow more segments (like college.edu.in)
        const domainParts = domainPart.split('.');
        if (domainParts.length < 2) {
            throw new Error('Invalid email format. It should have a domain like domain.com or domain.edu.in.');
        }

        // Ensure the domain is in the allowed list (now supporting multi-part domains)
        const isAllowedDomain = allowedDomains.some(domain => domainPart.endsWith(domain));
        if (!isAllowedDomain) {
            throw new Error('Email domain is not allowed. Please provide an email with a valid domain.');
        }

        // Check if the email already exists in the database (you can enable this part when implementing DB check)
        // const emailExists = await admin.findOne({ email });
        // if (emailExists) {
        //     throw new Error('This email is already registered. Please provide a different email.');
        // }

        return { isValid: true };
    } catch (error) {
        return { isValid: false, status: 400, message: error.message };
    }
};

module.exports = {
    index: async (req, res) => {
        try {
            return res.render("index", {
                success: req.flash("success"),
                error: req.flash("error")
            })
        } catch (error) {
            req.flash("error", "Internal server error");
            return res.redirect("/auth/login");
        }
    },
    login: async (req, res) => {
        try {
            const email = req.body.email;
            const password = req.body.password;
            if (!email || !password) {
                req.flash("error", "Invalid fields");
                return res.redirect("/auth/login");
            }
            const adminExists = await User.findOne({ email });
            if (!adminExists || adminExists.role !== "admin") {
                req.flash("error", "You dont have admin access");
                return res.redirect(("/auth/login"));
            }
            if (adminExists.status === "Inactive") {
                req.flash("error", "Your account is freezed");
                return res.redirect(("/auth/login"));
            }
            const matchedPassword = await bcrypt.compare(password, adminExists.password);
            console.log(matchedPassword);
            if (!matchedPassword) {
                req.flash("error", "Password is wrong");
                return res.redirect("/auth/login");
            }
            req.session.isAuth = true;
            req.session.admin = adminExists;
            req.session.save(err => {
                if (err) {
                    return next(err);
                }
                // //console.log("success");
                return res.redirect("/admin/dashboard");
            })
        } catch (error) {
            console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/auth/login");
        }
    },
    logout: async (req, res) => {
        try {
            req.session.destroy();
            return res.redirect("/auth/login");
        } catch (error) {
            //console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/auth/login");
        }
    },




    forgotPassword: async (req, res) => {
        return res.render('forgotPassword', {
            success: req.flash('success'),
            error: req.flash("error")
        })
    },

    sendOtp: async (req, res) => {
        try {
            const { email } = req.body;
            // if (!isValidEmail(email)) {
            //     req.flash('error', 'Invalid email format');
            //     return res.redirect('/auth/forgotpassword')
            // }
            const mailDetails = await isValidEmail(email);
            if (!mailDetails.isValid) {
                req.flash('error', 'Invalid email format');
                return res.redirect('/auth/forgotpassword');
            }
            const adminExists = await User.findOne({ email: email });
            if (!adminExists) {
                req.flash("error", "Email doesn't have admin access");
                return res.redirect('/auth/forgotpassword');
            }
            const generatedOtp = isGeneratedOtp();
            otpStore['otp'] = generatedOtp;
            otpStore['email'] = email;
            otpStore['time'] = Date.now();
            // console.log(otpStore);
            let mailSent = false;
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "yarishhh340@gmail.com",
                    pass: "rcmb xxzb lqmn uhpq"
                }
            });
            const mailOptions = {
                from: "yarishhh340@gmail.com",
                to: email,
                subject: "VERIFICATION MAIL",
                html: `
                <h2 style="color: #333;">OTP Verification</h2>
                <p>Dear User,</p>
                <p>Your one-time password (OTP) is:</p>
                <p style="font-size: 24px; background-color: #ffffff; color: #000000; padding: 10px; border-radius: 5px; text-align: center;">
                    ${generatedOtp}
                </p>
                <p>Please, Don't share your OTP with anyone. It is valid for only 10 minutes.</p>
                <p>Thank you for using EduConnect.</p>
                <p>Best regards,</p>
                <p><strong>The EduConnect Team</strong></p>
                `};
            // <p>If you did not request this OTP, please contact support immediately.</p>
            try {
                await transporter.sendMail(mailOptions);
                mailSent = true;
            } catch (error) {
                console.log(error);
                mailSent = false;
            }
            if (!mailSent) {
                return res.status(429).json({ message: "Failed to send otp" });
            }
            req.flash("success", "Otp Sent Successfully");
            return res.redirect(`/auth/otp?email=${email}`);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },
    otpGet: async (req, res) => {
        try {
            const email = otpStore['email'];
            return res.render('otpScreen', {
                Email: email,
                success: req.flash('success'),
                error: req.flash('error')
            })
        } catch (error) {
            console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/auth/forgotpassword");
        }
    },

    verifyOtp: async (req, res) => {
        try {
            const referer = req.headers.referer;
            const email = otpStore['email'];
            const time = otpStore['time'];
            const userOtp = req.body.otp;
            const timeExpiry = Date.now();
            const expirationTime = 10 * 60 * 1000;
            const generatedOtp = otpStore['otp'];
            if (!generatedOtp) {
                req.flash('error', 'Invalid OTP');
                return res.redirect(referer || '/');
            }

            if (timeExpiry - time > expirationTime) {
                req.flash('error', 'OTP has expired');
                return res.redirect(referer || '/');
            }

            if (generatedOtp != userOtp) {
                req.flash('error', "OTP doesn't match");
                return res.redirect(referer || '/');
            } else {
                req.flash("success", "OTP verified successfully you are able to change your password");
                return res.redirect(`/auth/updatepassword?email=${email}`);
            }
        } catch (error) {
            console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/auth/forgotpassword")
        }
    },
    updatePasswordGet: async (req, res) => {
        try {
            const referer = req.header('referer');
            const user = await User.findOne({ email: req.query.email });
            if (!user) {
                req.flash('error', 'Internal server error');
                return res.redirect(referer || '/');
            } else {
                return res.render('updatePassword', {
                    success: req.flash('success'),
                    error: req.flash('error'),
                    Email: user.email
                });
            }
        } catch (error) {
            console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/auth/forgotpassword");
        }
    },
    updatePasswordPost: async (req, res) => {
        try {
            const email = otpStore['email'];
            const password = req.body.password;
            const confirmPassword = req.body.confirm_password;
            // if (!email || !password || !confirmPassword) {
            //     req.flash("error", "Email, password, and confirm password are required");
            //     return res.redirect("/auth/forgotpassword");
            // }
            if (!confirmPassword) {
                req.flash('error', 'Confirm password is a required field.');
                return res.redirect('/auth/forgotpassword')
            }
            if (password !== confirmPassword) {
                req.flash("error", "Passwords do not match");
                return res.redirect(`/auth/updatepassword?email=${email}`);
            }
            const matchPassword = validPassword(password);
            if (!matchPassword) {
                req.flash("error", 'The password must be 8-14 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character. Please adjust your password accordingly.');
                return res.redirect(`/auth/updatepassword?email=${email}`);
            }
            const adminExists = await User.findOne({ email });
            if (!adminExists) {
                req.flash("error", "Admin not found");
                return res.redirect("/auth/forgotpassword");
            }
            const passwordMatch = await bcrypt.compare(password, adminExists.password);
            if (passwordMatch) {
                req.flash("error", "This password has already been used. Please choose a different one.");
                return res.redirect(`/auth/updatepassword?email=${email}`);
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const updatedPassword = await adminExists.updateOne({ $set: { password: hashedPassword } });
            if (!updatedPassword) {
                return res.status(400).json({ message: 'Password update failed.' });
            }
            delete otpStore['email'];
            delete otpStore['otp'];
            req.flash("success", "Password updated successfully");
            return res.redirect("/auth/login");
        } catch (error) {
            console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/auth/forgotpassword");
        }
    },


    ServiceProviderPrivacyPolicy: async (req, res) => {
        const allSettings = await Setting.findOne();
        // //console.log(allSettings);
        return res.render("ServiceProviderPrivacyPolicy", {
            allSettings: allSettings
        });
    },
    userPrivacyPolicy: async (req, res) => {
        const allSettings = await Setting.findOne();
        // //console.log(allSettings);
        return res.render("userPrivacyPolicy", {
            allSettings: allSettings
        });
    },
    // deleteAccountPolicy: async (req, res) => {
    //     const allSettings = await Setting.findOne();
    //     // //console.log(allSettings.deleteAccountPolicy);
    //     return res.render("deleteAccountPolicy", {
    //         deleteAccountPolicy: allSettings.deleteAccountPolicy
    //     });
    // }, 

}