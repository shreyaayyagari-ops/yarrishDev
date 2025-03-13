const Notification = require("../../../Models/NotificationModel.js");
const {sendWelcomeNotification} = require("../../../middleware/fireBaseMiddleware.js");
const User = require("../../../Models/userModel.js");
const AWS = require('aws-sdk');
const admin = require("firebase-admin");
const { uploadFile, deleteFile } = require('../../../middleware/awsMiddleware.js');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const s3 = new AWS.S3();

module.exports = {

    allNotifications: async (req, res) => {
        try {
            const allNotifications = await Notification.find().sort({ createdAt: -1 });
            return res.render('allNotifications', {
                allNotifications: allNotifications, 
                success: req.flash('success'),
                error: req.flash('error')
            })
        } catch (error) {
            req.flash('error', 'Internal server error');
            return res.redirect('/admin/dashboard')
        }
    },

    addNotification: async (req, res) => {
        try {
            const { title, message, image, role } = req.body;
    
            let imageUrl = null;
            if (image) {
                const uploadedImageUrl = await uploadFile(image, 'yaarish', 'notifications');
                if (!uploadedImageUrl) {
                    return res.status(500).json({ message: 'Error uploading image to S3' });
                }
                imageUrl = uploadedImageUrl;
            }
            const users = await User.find({ role, fcm_token: { $ne: [] } });
            const uniqueFcmTokens = new Set();
            users.forEach(user => {
                user.fcm_token.forEach(token => uniqueFcmTokens.add(token));
            });
            for (const fcmToken of uniqueFcmTokens) {
                if (!fcmToken) continue;
    
                const additionalData = { type: 'admin' };
    
                try {
                    await sendWelcomeNotification(
                        fcmToken,
                        title,
                        message,
                        imageUrl,
                        additionalData
                    );
                    console.log(`Notification sent successfully to token: ${fcmToken}`);
                } catch (error) {
                    console.error(`Error sending notification to token ${fcmToken}:`, error);
                    if (error.errorInfo && error.errorInfo.code === 'messaging/registration-token-not-registered') {
                        await User.updateOne(
                            { fcm_token: fcmToken },
                            { $pull: { fcm_token: fcmToken } }
                        );
                        console.log(`Invalid token removed: ${fcmToken}`);
                    }
                }
            }
            const newNotification = new Notification({
                Title: title,
                Text: message,
                image: imageUrl,
                additionalData: { type: 'role' }
            });
    
            await newNotification.save();
    
            req.flash('success', 'Notification sent');
            res.redirect('/admin/notifications');
        } catch (error) {
            console.error('Error adding notification:', error);
            req.flash('error', 'Internal server error');
            res.redirect('/admin/notifications');
        }
    }
    

};
