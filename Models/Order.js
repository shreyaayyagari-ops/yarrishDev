const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    ServiceProvidername: {
        type: String,
        required: false

    },

    ServiceProviderphone: {
        type: String,
        required: false
    },

    currency: {type: String, required: false},
    

    
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true,
    },
    txnId: {
        type: String,
        required: true,
        unique: true,
    },
    amount: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failure'],
        default: 'pending',
    },
    paymentGatewayResponse: {
        type: Object,
        default: {},
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
