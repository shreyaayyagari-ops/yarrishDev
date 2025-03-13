const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
    //user details
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    //subscription details
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
    days: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: String, required: true },
    SubscriptionExpiresOn: { type: Date, required: false },
    order_Id: { type: String, required: false },
    paymentId: { type: String, required: false },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const subscribers = mongoose.model("subscribers", subscriberSchema);

module.exports = subscribers;