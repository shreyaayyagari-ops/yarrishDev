const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId,ref: 'User',required: false},
    address: {type: String,required: false},
    latitude : {type : String,required : false},
    longitude : {type : String,required : false},
    serviceProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    status: { type: Boolean, required: false, default: false }
},{
    timestamps: true
});

AddressSchema.set('toJSON', { virtuals: true });
AddressSchema.set('toObject', { virtuals: true });

const Address = mongoose.model('Address', AddressSchema);

module.exports = Address;
