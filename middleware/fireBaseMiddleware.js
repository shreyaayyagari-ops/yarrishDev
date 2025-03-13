const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(require('../utilis/firebase.json')),
});

const sendWelcomeNotification = async (fcmToken, Title, Text, image, data) => {
    try {
        if (!fcmToken) {
            return 'No FCM token provided for the user';
        }
        // Include custom data in the message if provided
        const message = {
            notification: {
                title: Title,
                body: Text,
                image: image
            },
            data,
            token: fcmToken,
        };

        const response = await admin.messaging().send(message);
        console.log('Welcome notification sent successfully:', response);
        return null;
    } catch (error) {
        console.error('Error sending welcome notification:', error);
        return error;
    }
};



module.exports = { sendWelcomeNotification };