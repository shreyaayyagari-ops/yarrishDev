const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    bannerPicture: { type: String, required: true },
    status: {
        type: String,
        required: true,
        default: "Active"
    }
},
    {
        timestamps: true
    });

const banners = mongoose.model('banner', bannerSchema);

module.exports = banners;