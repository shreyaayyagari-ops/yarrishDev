const mongoose = require('mongoose');

const crewSchema = new mongoose.Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: false },
    name: { type: String, required: true },
    designation: { type: String, required: true },
    picture: { type: String, required: true },
}, {
    timestamps: true
});

const crew = mongoose.model('crew', crewSchema);

module.exports = crew;