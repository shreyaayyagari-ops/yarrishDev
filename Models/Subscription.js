const mongoose = require('mongoose')

const SubscriptionSchema = new mongoose.Schema({
    name: { type: String,required: true},
    days: {type: Number,required: true},
    price: {type: Number,required: true},
    discount: {type: String,required: true},
    // referralCode: {type: String,  required: false,  unique: true  },
    status: {type: String,default:'Active',required: true}
},{timestamps: true},
 { toJSON: { virtuals: true }});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);
module.exports = Subscription;