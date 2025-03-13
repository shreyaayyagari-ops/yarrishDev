const mongoose = require("mongoose");

const datesAndShowsSchema = new mongoose.Schema({
    screen: { type: mongoose.Schema.Types.ObjectId, ref: "Screen", required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true},
    date: { type: Date, required: true },
    show: [{ type: String, required: true }],
    shows: [{
        showId: { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: false },
        showName: [{ type: String, required: false }],
        showTime: [{ type: String, required: false }],
    }],
    status: {type: String, required: false, default: 'Active'},
}, {
    timestamps: true
});

const datesAndShows = mongoose.model('datesAndShows', datesAndShowsSchema);

module.exports = datesAndShows;

// [
//     {
//         "screen": "asdfAS244",
//         "movie": "asdfAS244",
//         "date": "12/04/2024",
//         "show": [
//             {
//                 "showId": "asdfAS244",
//             },
//             {
//                 "showId": "asdfAS244",
//             },            
//         ]
//     },
//     {
//         "screen": "asdfAS244",
//         "movie": "asdfAS244",
//         "date": "13/04/2024",
//         "show": [
//             {
//                 "showId": "asdfAS244",
//             },
//             {
//                 "showId": "asdfAS244",
//             },
//             {
//                 "showId": "asdfAS244",
//             },
//             {
//                 "showId": "asdfAS244",
//             },
//             {
//                 "showId": "asdfAS244",
//             },            
//         ]
//     },
// ]