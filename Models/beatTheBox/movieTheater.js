const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const movieTheaterSchema = new mongoose.Schema({
    movieTheaterOwnerName: { type: String, required: false },
    // movieTheaterName: { type: String, required: false },
    email: { type: String, required: true },
    phoneNumber: { type: Number, required: false, unique: true },
    fcm_token: { type: [String], default: [] },
    password: { type: String, required: true, default: "" },
    //executive details
    executive: { type: mongoose.Schema.Types.ObjectId, ref: 'executive', required: true },
    executiveName: { type: String, required: true },
    executiveEmail: { type: String, required: true },
    executiveNumber: { type: String, required: true },
    //movie details
    // movie_details: { type: mongoose.Schema.Types.ObjectId, ref: 'movie_details', required: false },
    movieTheaterName: { type: String, required: false },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'city', required: false },
    cityName: { type: String, required: false },
    Area: { type: String, required: false },
    Address: { type: String, required: false },
    latitude: {type: String, required: false},
    longitude: {type: String, required: false},
    theaterLogo: { type: String, required: false },
    //bank details
    // bank_details: { type: mongoose.Schema.Types.ObjectId, ref: 'bank_details', required: false },
    bankName: {type: String, required: false},
    accountNumber : { type: String,required: false },
    accountType : { type: String, required: false},
    Branch:  {type: String, required: false},
    IFSC_code:{ type: String, required: false }, 
    status: { type: String, required: false, default: 'Active' },
    screen_status: {type: String, required: false, default: 'MovieDetails'}
}, {
    timestamps: true
});

//register
movieTheaterSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//LOGIN
movieTheaterSchema.methods.matchPassword = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
};


const movieTheater = mongoose.model("movieTheater", movieTheaterSchema);
module.exports = movieTheater;