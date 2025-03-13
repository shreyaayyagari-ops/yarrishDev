const Notification = require('../../Models/NotificationModel');
const jwt = require("jsonwebtoken");

module.exports = {
    getNotifications: async (req, res) => {
        try {
            const userId = req.userId
            if (!userId) {
				return res.status(400).json({ status: 'fail', message: 'User ID is missing in the request parameters!' });
			}
            const allNotifications = await Notification.find().sort({ createdAt: -1 }); 
            return res.status(200).json({
                success: true,
                message: 'Notifications retrieved successfully.',
                data: allNotifications
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

}