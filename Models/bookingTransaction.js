const mongoose = require('mongoose');

const bookingTransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: false },
    userPhone: { type: Number, required: false },
    userEmail: { type: String, required: false },
    serviceProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    serviceProviderName: { type: String, required: false },
    serviceProviderPhone: { type: Number, required: false },
    serviceProviderEmail: { type: String, required: false },
    services: [{
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
        serviceId: { type: String, required: false },
        serviceName: { type: String, required: false },
        // servicePic: { type: String, required: false },
    }],
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    bookingDate: { type: String, required: false },
    bookingTime: { type: String, required: false },
    bookingAmount: { type: String, required: false },
    bookingStatus: {type: String, required: false, default: 'pending'},
    paymentStatus: {
        type: String,
        enum: ['success', 'Failed']
    },
    
    paymentId: {
        type: String
    },
    transactionAmount: {
        type: Number
    },
}, {
    timestamps: true

});

module.exports = mongoose.model('BookingTransaction', bookingTransactionSchema);