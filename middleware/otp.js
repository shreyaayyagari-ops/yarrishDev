const nodemailer = require('nodemailer');
require('dotenv').config();


const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a 4 digit OTP
};

const sendOTP = async (email) => {
  const otp = generateOTP();

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASSWORD, // Your email password
    },
  });

  const mailOptions = {
    from: '"yaarish" <yarishhh340@gmail.com>', // sender address
    to: email, // receiver's email
    subject: 'Your OTP Code',
    html: `
      <div style="padding: 30px;">
        <h2 style="color: #333333; text-align: center;">Verify Your Account</h2>
        <p style="font-size: 16px; color: #555555; text-align: center;">Hello,</p>
        <p style="font-size: 16px; color: #555555; text-align: center;">To access your account, please use the OTP code
            below:</p>
        <div style="text-align: center; margin: 20px 0;">
            <p
                style="font-size: 22px; font-weight: bold; color: #4a90e2; border: 2px dashed #4a90e2; display: inline-block; padding: 10px 20px;">
                ${otp}</p>
        </div>
        <p style="font-size: 16px; color: #555555; text-align: center;">This code is valid for 5 minutes. Please do not
            share it with anyone.</p>
        <p style="font-size: 14px; color: #888888; text-align: center;">If you did not request this code, please
            disregard this email.</p>
    </div>
    `
  };


  try {
    let info = await transporter.sendMail(mailOptions);
    return { success: true, otp: otp };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error };
  }
};




module.exports = { sendOTP };