const mongoose = require("mongoose");

const screenSchema = new mongoose.Schema(
  {
    screenName: { type: String, required: true },
    screenTotalColumns: { type: Number, required: false },
    movieTheater: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'MovieTheater', },
    seatLayoutStatus: { type: Boolean, required: false, default: false },
    seatTypes: [{ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'seatLayout' }],
    // seatTypes: { type: [seatTypeSchema], required: false, default: [] },
    status: { type: String, required: false, default: 'Active' },
  },
  { timestamps: true }
);

const Screen = mongoose.model("Screen", screenSchema);

module.exports = Screen;

// const columnSchema = new mongoose.Schema(
//   {
//     seatId: { type: String, default: null }, // Optional, allows null for empty seats
//     position: { type: Number, required: true }, // Required position
//     availability: { type: String, required: false, default: "available" } // seat status
//   },
//   { _id: false }
// );

// const rowSchema = new mongoose.Schema(
//   {
//     rowId: { type: Number, required: true },
//     rowLabel: { type: String, required: true }, // Can be "-" for empty rows
//     columns: { type: [columnSchema], required: true, default: [] } // Default empty array for columns
//   },
//   { _id: false }
// );

// const seatTypeSchema = new mongoose.Schema(
//   {
//     seatType: { type: String, required: true },
//     seatingPosition: { type: String, required: true },
//     price: { type: Number, required: true }, // Optional for seat types without price
//     rows: { type: [rowSchema], required: true, default: [] } // Default empty array for rows
//   },
//   { _id: true }
// );