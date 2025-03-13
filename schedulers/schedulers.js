const mongoose = require('mongoose');
const CronJob = require('node-cron');
const Notification = require('../Models/NotificationModel');
const User = require('../Models/userModel');
const Subscribers = require('../Models/subscriber');

exports.initScheduledJobs = () => {
    const scheduledJobFunction = CronJob.schedule("0 0 1 * *", () => {
        deleteNotification();
    });
    scheduledJobFunction.start();
};

async function deleteNotification() {
    try {
        const now = new Date();
        await Notification.deleteMany({ createdAt: { $lt: now } });
        console.log('Old notifications deleted successfully');
    } catch (error) {
        console.error('Error deleting notifications:', error);
    }
}

exports.initScheduledOtp = () => {
    const scheduledJobFunction = CronJob.schedule("*/10 * * * *", () => { 
        // console.log("Scheduler triggered at", new Date())
        deleteUserIfNotVerified();
    });
    scheduledJobFunction.start();
};

async function deleteUserIfNotVerified() {
    try {
        const now = new Date();
        const filterCriteria = {
            otp_expiry: { $lt: now },  
            otp_status: 'Sent',       
            role: { $in: ['user', 'service_provider'] }
        };

        const usersToDelete = await User.find(filterCriteria);
        if (usersToDelete.length > 0) {
            // console.log(`Deleting ${usersToDelete.length} unverified users...`);
            await User.deleteMany(filterCriteria);
        } else {
            console.log('No expired OTP users to delete.');
        }
    } catch (error) {
        console.error('Error deleting users:', error);
    }
}

exports.initScheduledSubscriptionUsers = () => {
    const scheduledJobFunction = CronJob.schedule("*/10 * * * *", () => {
        inactiveIfExpired();

    });


}

async function inactiveIfExpired() {
    try {
        const now = new Date();
        const expiredSubscriptions = await Subscribers.find({
            status: 'Active',
            subscription_end: { $lt: now }
        }).populate('user', '_id');
        const userIds = expiredSubscriptions.map(sub => sub.user._id);
        if (userIds.length > 0) {
            const deleteResult = await Subscribers.deleteMany({
                status: 'Active',
                subscription_end: { $lt: now }
            });
            const updateResult = await User.updateMany(
                { _id: { $in: userIds } },
                { $set: { payment_status: false } }
            );
            console.log(`${deleteResult.deletedCount} expired subscriptions deleted.`);
            console.log(`${updateResult.modifiedCount} users' payment statuses updated to false.`);
        } else {
            console.log('No expired subscriptions found.');
        }
    } catch (error) {
        console.error('Error deleting expired subscriptions or updating payment status:', error);
    }
}