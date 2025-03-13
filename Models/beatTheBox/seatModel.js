const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema(
    {
        seatId: { type: String, default: null }, // Optional, allows null for empty seats
        position: { type: Number, required: true }, // Required position
        availability: { type: String, required: false, default: "available" } // seat status
    },
    { _id: false }
);

const rowSchema = new mongoose.Schema(
    {
        rowId: { type: Number, required: true },
        rowLabel: { type: String, required: true }, // Can be "-" for empty rows
        columns: { type: [columnSchema], required: true, default: [] } // Default empty array for columns
    },
    { _id: false }
);

const seatTypeSchema = new mongoose.Schema(
    {
        screenId: { type: mongoose.Schema.Types.ObjectId, ref: "Screen"},
        seatType: { type: String, required: true },
        seatingPosition: { type: String, required: true },
        price: { type: Number, required: true }, // Optional for seat types without price
        rows: { type: [rowSchema], required: true, default: [] } // Default empty array for rows
    },
    { timestamps: true }
);

const seatLayout = mongoose.model("seatLayout", seatTypeSchema);

module.exports = seatLayout;