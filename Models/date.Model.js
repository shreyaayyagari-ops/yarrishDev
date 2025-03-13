const mongoose = require('mongoose');

const BookingDateSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    date: { 
        type: Date,  
        required: true
    }
});



const BookingDate = mongoose.model('BookingDate', BookingDateSchema);

module.exports = BookingDate;
