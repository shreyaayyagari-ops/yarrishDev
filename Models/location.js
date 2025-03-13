const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  address: { type: String, required: true },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
