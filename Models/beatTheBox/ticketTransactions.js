const mongoose = require('mongoose');


const ticketTransactionsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: false },
    userPhone: { type: Number, required: false },
    movieTheaterId: { type: mongoose.Schema.Types.ObjectId, ref: 'MovieTheater', required: false },
    movieTheaterName: { type: String, required: false },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: false },
    movieName: { type: String, required: false },
    movieGenre: { type: String, required: false },
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: false },
    showName: { type: String, required: false },
    showTime: { type: String, required: false },
    date: { type: String, required: false },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: false },
    ticketId: { type: String, required: false },
    ticketStatus: { type: String, required: false, default: 'pending' },
    seatNo: { type: String, required: false },
    price: { type: Number, required: false },
    location: { type: String, required: false },
    paymentId: { type: String, required: false },


});

module.exports = mongoose.model('TicketTransactions', ticketTransactionsSchema);