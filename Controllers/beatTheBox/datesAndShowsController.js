const mongoose = require("mongoose");

const datesAndShows = require("../../Models/beatTheBox/datesAndShows.js");
const Shows = require("../../Models/beatTheBox/showTiming.js");
const Movie = require("../../Models/beatTheBox/Movie.js");

module.exports = {
    getDatesAndShows: async (req, res) => {
        try {
            const movieId = req.params.id;
            if (!movieId) {
                return res.status(400).json({ message: "Invalid movie Id" });
            }
            const movieExists = await Movie.findById(movieId);
            if (!movieExists) {
                return res.status(400).json({ message: "Invalid movie details" });
            }
            const datesAndTimes = await datesAndShows.find({ movie: movieId }).populate("show");
            return res.status(200).json({ datesAndTimes });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    addDatesAndShows: async (req, res) => {
        try {
            const { movieId, date, show } = req.body;
            if (!movieId || !date || !Array.isArray(show) || show.length === 0) {
                return res.status(400).json({ message: "Invalid input: movieId, date, and show aare required." });
            }
            if (!movieId) {
                return res.status(400).json({ message: "Invalid movie Id" });
            }
            const movieExists = await Movie.findById(movieId);
            if (!movieExists) {
                return res.status(400).json({ message: "Invalid movie details" });
            }
            const allocatedScreenId = movieExists.screen;
            const invalidShow = await Shows.findOne({
                _id: { $in: show },
                screenId: { $ne: allocatedScreenId }
            });
            if (invalidShow) {
                return res.status(400).json({
                    error: `Show with ID ${invalidShow._id} is not allocated to the correct screen.`
                });
            }
            const [day, month, year] = date.split('/');
            if (!day || !month || !year) {
                return res.status(400).json({ message: "Invalid date format. Please use DD/MM/YYYY." });
            }
            const formattedDate = new Date(`${year}-${month}-${day}`);
            const conflictingShows = await datesAndShows.find({
                date: formattedDate,
                show: { $in: show },
            });
            if (conflictingShows.length > 0) {
                return res.status(400).json({
                    message: `One or more shows are already scheduled for this date.`,
                });
            }
            await datesAndShows.create({ movie: movieId, screen: movieExists.screen, date: formattedDate, show });
            return res.status(200).json({ message: "Date and Time added successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    updateDatesAndShows: async (req, res) => {
        try {
            const dateId = req.params.id;
            const datesAndShowsExists = await datesAndShows.findById(dateId);
            if (!datesAndShowsExists) {
                return res.status(404).json({ message: "Record not found." });
            }
            if (datesAndShowsExists.status === "Active") {
                datesAndShowsExists.status = "Inactive";
                await datesAndShowsExists.save();
                return res.status(200).json({ message: "Status is Inactive." });
            } else {
                datesAndShowsExists.status = "Active";
                await datesAndShowsExists.save();
                return res.status(200).json({ message: "Status is Active." });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    dateBasedMovies: async (req, res) => {
        try {
            const date = req.params.date;
            if (!date) {
                return res.status(400).json({ message: "Date is required" });
            }
            const parsedDate = new Date(date);
            if (isNaN(parsedDate)) {
                return res.status(400).json({ message: "Invalid date format" });
            }
            const showsByDate = await datesAndShows.find({ date: parsedDate }).populate('screen', '_id screenName seatLayoutStatus status').populate('movie').populate('show', 'showName showTime status').sort({ createdAt: -1 });
            if (showsByDate.length === 0) {
                return res.status(400).json({ message: "No shows found for the given date" });
            }
            // if(!showsByDate.movie) {
            //     return res.status(400).json({ message: "No movie found" });
            // }
            return res.status(200).json({ showsByDate });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },
    availableSlots: async (req, res) => {
        try {
            const movieId = req.params.id;
            const movieExists = await Movie.findById(movieId);
            if (!movieExists) {
                return res.status(400).json({ message: "Invalid movie details" });
            }
            const slots = await datesAndShows.aggregate([
                {
                    $match: {
                        movie: new mongoose.Types.ObjectId(movieId)
                    }
                },
                {
                    $lookup: {
                        from: "shows",
                        localField: "show",
                        foreignField: "_id",
                        as: "showDetails"
                    }
                },
                {
                    $unwind: "$showDetails"
                },
                {
                    $match: {
                        "showDetails.status": "Active"
                    }
                },
                {
                    $group: {
                        _id: "$date",
                        totalShows: { $sum: 1 },
                        availableSlots: { $sum: { $cond: [{ $eq: ["$showDetails.status", "Active"] }, 1, 0] } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        totalShows: 1,
                        availableSlots: 1
                    }
                },
                {
                    $sort: { date: 1 }
                }
            ]);
            return res.status(200).json({ data: slots });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}