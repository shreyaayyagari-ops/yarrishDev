const mongoose = require('mongoose');

const TimeSchema = new mongoose.Schema({
    time: { type: String, required: true }
}, {
    timestamps: true
});

const Time = mongoose.model('Time', TimeSchema);

module.exports = Time;