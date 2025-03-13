const mongoose = require('mongoose');

const CastAndCrewSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie', 
    required: false,
  },
  cast: [
    {
      originalName: { type: String, required: true },
      nameInMovie: { type: String, required: true },
      castPhoto: { type: String, required: true },

    },
  ],


});

const CastAndCrew = mongoose.model('CastAndCrew', CastAndCrewSchema);

module.exports = CastAndCrew;
