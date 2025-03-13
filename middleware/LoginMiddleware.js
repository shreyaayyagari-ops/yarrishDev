
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require("uuid"); 



const generateRandomPassword = async () => {
    return new Promise((resolve) => {
        const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
        const numberChars = "0123456789";
        const specialChars = "!@#$%^&*()_+[]{}|;:,.<>?";
        const getRandomChar = (charSet) => charSet[Math.floor(Math.random() * charSet.length)];
        let password = '';
        password += getRandomChar(upperCaseChars);  
        password += getRandomChar(lowerCaseChars);  
        password += getRandomChar(numberChars);     
        password += getRandomChar(specialChars);    

        const allChars = upperCaseChars + lowerCaseChars + numberChars + specialChars;
        while (password.length < 12) {
            password += getRandomChar(allChars);
        }

        // Shuffle password to ensure randomness
        password = password.split('').sort(() => Math.random() - 0.5).join('');
        resolve(password);
    });
};


const sendMailCredentials = async (email, username, password) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "yarishhh340@gmail.com",
            pass: "rcmb xxzb lqmn uhpq"
        }
    });
    const mailOptions = {
        from:"yarishhh340@gmail.com",
        to: email,
        subject: "Your Account Credentials",
        html: `
            <div style="background-color:#f4f4f4; padding:20px; font-family:Arial, sans-serif;">
                <div style="max-width:600px; margin:auto; background-color:white; padding:20px; border-radius:10px; box-shadow:0px 0px 10px rgba(0, 0, 0, 0.1);">
                    <h2 style="color:#333; text-align:center;">Your Account Credentials</h2>
                    <p style="font-size:16px; color:#555;">
                        Dear ${username},
                    </p>
                    <p style="font-size:16px; color:#555;">
                        Here are your login credentials for your account:
                    </p>
                    <div style="background-color:#f9f9f9; padding:15px; text-align:center; font-size:18px; font-weight:bold; border-radius:5px; margin:20px 0;">
                        Username: <span style="color:#333;">${username}</span><br>
                        Password: <span style="color:#333;">${password}</span>
                    </div>
                    <p style="font-size:14px; color:#777;">
                        We recommend changing your password after your first login.
                    </p>
                    <p style="font-size:14px; color:#777;">
                        Best regards,<br>HEALR CONNECT
                    </p>
                </div>
            </div>`,
    };
    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(`Error while sending email to ${email}`, error);
            return false;
        }
    });
    return true;
};

isGeneratedOtp = () => {
    return Math.floor(1000 + Math.random() * 9000);
}
let otpStore = {}

const sendOtp = async (req, res) => {
    try {
        const { email_id } = req.body;

        const generatedOtp = isGeneratedOtp();
        otpStore['otp'] = generatedOtp;
        otpStore['email_id'] = email_id;
        otpStore['time'] = Date.now();

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
            to: email_id,
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
            `
        };
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
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};




module.exports = {
    generateRandomPassword,
    sendMailCredentials,
    sendOtp

}

