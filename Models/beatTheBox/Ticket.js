const mongoose = require('mongoose');
const movieTheater = require('./movieTheater');

const ticketSchema = new mongoose.Schema({
    TicketId: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    Price: { type: Number, required: true },
    SeatNo: { type: String, required: true },
    TicketStatus: { type: String, default: 'pending' },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    movieName: { type: String, required: true },
    movieType: { type: String },
    movieLanguage: { type: String },
    movieImage: { type: String },
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    showTime: { type: String, required: true },
    screen: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true },
    screenName: { type: String },
    movieTheater: { type: mongoose.Schema.Types.ObjectId, ref: 'MovieTheater', required: true },
    movieTheaterName: { type: String },
    location: { type: String, required: true },
  });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;