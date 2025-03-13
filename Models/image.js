const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema ({
    image: { type: String, required: true }
}, {
    timestamps: true
});

const image = mongoose.model('image', imageSchema);

module.exports = image;