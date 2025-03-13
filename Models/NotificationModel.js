const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true,
    },
    Text: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        required: true,
        enum: [ "user", "service_provider"],
        default: 'user'
    },
   
 additionalData: { type: Object, required: false }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
