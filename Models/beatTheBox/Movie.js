const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  movieName: { type: String, required: false },
  moviePoster: { type: String, required: false },
  movieGenre: { type: String, required: false },
  duration: { type: String, required: false },
  censorship: { type: String, required: false },
  language: { type: String, required: false },
  status: { type: String, required: false, default: "Active" },
  screen: { type: mongoose.Schema.Types.ObjectId, ref: "Screen", required: false },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'city', required: false },
}, {
  timestamps: true
});

const Movie = mongoose.model('Movie', MovieSchema);

module.exports = Movie;