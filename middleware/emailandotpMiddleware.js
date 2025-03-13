const nodemailer = require('nodemailer');
//
async function sendEmailOTP(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // Replace with your email provider
        auth: {
            user: 'your-email@gmail.com', // Your email
            pass: 'your-email-password', // Your email password
        },
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Your OTP for Login',
        text: `Dear user, Your OTP is ${otp}. Please verify within 10 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP sent via email');
        return true;
    } catch (error) {
        console.error('Error sending email:', error.message);
        return false;
    }
}
module.exports = {
    sendEmailOTP
}