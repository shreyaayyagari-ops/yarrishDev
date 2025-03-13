const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
    timeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Time',
        required: false
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    serviceId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: false
    }],
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false
    },
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: false
    },
    status: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'accepted', 'declined', 'canceled', 'completed']
    },
    serviceProviderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : false
    },
    date: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookingDate',
        required: false
    },
    time: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Time',
    },
    paymentStatus: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'accepted', 'declined']
    },
    serviceMenCount: {
        type: String,
        required: false
    },
    TotalAmount: {
        type: String,
        required: false
    },
    serviceProviderPhone: { 
        type: Number,
        required : false 
    },
    icon: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

const Wishlist = mongoose.model('Wishlist', WishlistSchema);
module.exports = Wishlist;
