const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Service = require('../Models/Service.js');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true, unique: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    password: { type: String, required: false },
    confirmPassword: { type: String, requried: false },
    role: { type: String, required: true, enum: ["admin", "user", "service_provider"], default: 'user' },
    activeRole: { type: String, enum: ["user", "service_provider"], default: 'user' },
    country_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Country', required: false },
    photo: { type: String, required: false },
    status: { type: String, required: false, default: 'Active' },
    otp: { type: String, required: false },
    otp_status: { type: String, required: false },
    otp_expiry: { type: Date, required: false },
    fcm_token: { type: [String], default: [] },

    //auth verification
    passport_status: { type: Boolean, default: false },
    aadhar_status: { type: Boolean, default: false },
    driving_license_status: { type: Boolean, default: false },
    aadhar_no: { type: String, required: false, default: "" },
    aadhaarData: { type: Object, required: false, default: {} },
    passport_no: { type: String, required: false, default: "" },
    passportDetails: { type: String, required: false, default: "" },
    drivers_license_no: { type: String, required: false, default: "" },
    decryptLink: { type: String, required: false },

    //wallet
    wallet: { type: Number, required: true, default: 0 },
    walletTransactions: [
        {
            amount: { type: Number, required: true },
            type: { type: String, enum: ["credit", "debit"], required: true },
            description: { type: String, required: true },
            date: { type: Date, default: Date.now },
        },
    ],
    //refferal
    referralCode: { type: String, unique: true, required: false },
    referredBy: { type: String },
    referralUsed: { type: Boolean, default: false },

    //address
    address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: false },
    lat: { type: String, required: false },
    long: { type: String, required: false },
    is_address: { type: Boolean, required: false, default: false }, // if the value is true re-direct to address screen, if value is false re-direct to dashboard

    //user services
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],

    subscription_end: { type: Date, required: false },
    subscription_status: { type: Boolean, required: false, default: false },
    sp_authenticated: { type: Boolean, default: false },
    can_access: { type: Boolean, default: false },
    // requiredVerification: { type: String, default: false }, //aadhaar, passport, driving
    // selectServices: { type: Boolean },
    // selectLocation: { type: Boolean },
    // selectSubscription: { type: Boolean },
    // proofVerification: { type: Boolean },

    //Verification screen status for verification screens for service provider after vderify otp screen
    screen_status: { type: String, default: "services", required: false },
}, {
    timestamps: true
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.pre("save", function (next) {
    if (this.isNew) {
        this.referralCode = `REF-${this._id.toString().slice(-6).toUpperCase()}`;
    }
    next();
});

const User = mongoose.model("User", UserSchema);
module.exports = User;