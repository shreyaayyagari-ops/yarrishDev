const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

const executiveSchema = new mongoose.Schema({
    name: {
        type: String, required: true
    },

    email: {
        type: String, required: true, uniqure: true
    },

    phone : {
        type: Number, required : true, unique: true
    },

    password : {type: String, required: false, default: ""
},

role: {
    type: String,
    required: true,
    default : "executive"
},

status: { type: String, required: false, default: 'Active' },

});

const executive = mongoose.model("executive", executiveSchema);

module.exports = executive;