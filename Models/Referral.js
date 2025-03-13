const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true, 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, 
  },
  rewardAmount: {
    type: Number,
    required: true, 
  },
  isActive: { type: Boolean, default: true },
  usageCount: {
    type: Number,
    default: 0, 
  },
}, { timestamps: true });

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;
