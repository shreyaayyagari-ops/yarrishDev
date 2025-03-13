const mongoose = require('mongoose');

const castSchema = new mongoose.Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: false },
    name: { type: String, required: true },
    nameInMovie: { type: String, required: true },
    picture: { type: String, required: true },
}, {
    timestamps: true
});

const cast = mongoose.model('cast', castSchema);

module.exports = cast;