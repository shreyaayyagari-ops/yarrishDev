const mongoose = require("mongoose");

const ShowSchema = new mongoose.Schema({
  showName: { type: String, required: true },
  showTime: { type: String, required: true },
  status: {type: String, required: false, default: 'Active'},
  screenId: { type: mongoose.Schema.Types.ObjectId, ref: "Screen", required: true }
}, {
  timestamps: true
});

const Show = mongoose.model('Show', ShowSchema);

module.exports = Show;