const mongoose = require('mongoose');

const BookingIrderSchema = new mongoose.Schema({
    bookingId: {type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: false},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    firstname: {type: String, required: false},
    email: {type: String, required: false},
    phone: {type: String, required: false},
    txnId:  {type: String, required: false},
    amount: {type: String, required: false},
})