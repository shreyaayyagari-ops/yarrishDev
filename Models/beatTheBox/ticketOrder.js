const mongoose = require('mongoose');

const ticketOrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    key: { type: String, required: true },
    userName: { type: String, required: false },
    userPhone: { type: String, required: false },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true }],
    seatNo: { type: String, required: false },
    price: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    orderId: { type: String, required: true, unique: true },
    // surl: { type: String, required: true },
    // furl: { type: String, required: true },
  });

const TicketOrder = mongoose.model('TicketOrder', ticketOrderSchema);

module.exports = TicketOrder;
