const nodemailer = require("nodemailer");

exports.sendMail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "smtp",
        host: "mail.educonnectindia.com",
        port: 465,
        secure: true, // Use true for port 465
        auth: {
            user: "info@educonnectindia.com",
            pass: "Analogue@123"
        }
    });

    const mailOptions = {
        from: "info@educonnectindia.com",
        to: email,
        subject: "OTP Verification",
        html: `
            <div style="background-color:#f4f4f4; padding:20px; font-family:Arial, sans-serif;">
                <div style="max-width:600px; margin:auto; background-color:white; padding:20px; border-radius:10px; box-shadow:0px 0px 10px rgba(0, 0, 0, 0.1);">
                    <h2 style="color:#333; text-align:center;">OTP Verification</h2>
                    <p style="font-size:16px; color:#555;">Dear User,</p>
                    <p style="font-size:16px; color:#555;">Please use the following OTP to verify your account:</p>
                    <div style="background-color:#f9f9f9; padding:15px; text-align:center; font-size:20px; font-weight:bold; border-radius:5px; margin:20px 0;">
                        ${otp}
                    </div>
                    <p style="font-size:14px; color:#777;">If you did not request this OTP, please ignore this email.</p>
                    <p style="font-size:14px; color:#777;">Best regards,<br>EduConnect India Team</p>
                </div>
            </div>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true; 
    } catch (error) {
        //console.log(`Error while sending email to ${email}:`, error);
        return false; 
    }
};
