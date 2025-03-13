const { mongoose, Schema, model } = require('mongoose');

const CurrencySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true, 
    },
    symbol: {
        type: String,
        required: true,
    },
    country: {
        type: Schema.Types.ObjectId, 
        ref: 'Country',
        required: true,
    },
    status: {
        type: String,
        default: 'Active',
        required: true,
    },
}, { timestamps: true }, { toJSON: { virtuals: true } });

const Currency = model('Currency', CurrencySchema);
module.exports = Currency;
