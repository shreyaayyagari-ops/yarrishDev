const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
 cityName: {type: String, required: false},
 status: {type: String, required: false, default: 'Active'}

});

const city = mongoose.model('city', CitySchema);

module.exports = city;