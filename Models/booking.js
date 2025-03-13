// models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    date: { type: Date, required: false },
    time: { type: String, required: false },
    services: [{
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
        serviceId: { type: String, required: false },
        serviceName: { type: String, required: false },
        servicePic: { type: String, required: false },
    }],
    //user details
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: false },
    userPhone: { type: Number, required: false },
    userEmail: { type: String, required: false },
    //address
    address: { type: String, required: false },
    latitude: { type: String, required: false },
    longitude: { type: String, required: false },
    //service provider details
    serviceProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    serviceProviderName: { type: String, required: false },
    serviceProviderPhone: { type: Number, required: false },
    serviceProviderEmail: { type: String, required: false },
    //other details
    // serviceMenCount: { type: String, required: false },
    TotalAmount: { type: Number, required: false },
    // icon: { type: String, required: false },
    paymentStatus: { type: String, required: false, default: 'pending', enum: ['pending', 'Verified'] },
    bookingStatus: { type: String, required: false, default: 'pending', enum: ['pending', 'accepted', 'declined', 'canceled', 'completed'] },
}, { timestamps: true, toJSON: { virtuals: true } }
);

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;