const nodemailer = require("nodemailer");

exports.sendGmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "yarishhh340@gmail.com",
            pass: "wrir jahb wcbj uvlz"
        }
    });
    const mailOptions = {
        from: "yarishhh340@gmail.com",
        to: email,
        subject: "Otp verification",
        html: `
            <div style="background-color:#f4f4f4; padding:20px; font-family:Arial, sans-serif;">
                <div style="max-width:600px; margin:auto; background-color:white; padding:20px; border-radius:10px; box-shadow:0px 0px 10px rgba(0, 0, 0, 0.1);">
                    <h2 style="color:#333; text-align:center;">OTP Verification</h2>
                    <p style="font-size:16px; color:#555;">
                        Dear User,
                    </p>
                    <p style="font-size:16px; color:#555;">
                        Please use the following OTP to verify your account:
                    </p>
                    <div style="background-color:#f9f9f9; padding:15px; text-align:center; font-size:20px; font-weight:bold; border-radius:5px; margin:20px 0;">
                        ${otp}
                    </div>
                    <p style="font-size:14px; color:#777;">
                        If you did not request this OTP, please ignore this email.
                    </p>
                    <p style="font-size:14px; color:#777;">
                        Best regards,<br>Yaarishhh
                    </p>
                </div>
            </div>`,
    }
    await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(`Error while sending email to ${email}`, error);
            return false
        }
    });
    return true;
}