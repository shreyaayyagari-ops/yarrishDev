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

            const datesAndTimes = await datesAndShows
                .find({ movie: movieId })
                .populate('screen', 'name')
                .populate('shows.showId', 'showName')

            const formattedDatesAndTimes = datesAndTimes.map(item => ({
                dateId: item._id,
                date: item.date,
                shows: item.shows.map(show => ({
                    showId: show.showId._id,
                    showName: show.showId.showName,
                })),
            }));

            return res.status(200).json({ datesAndTimes: formattedDatesAndTimes });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    ,
    addDatesAndShows: async (req, res) => {
        try {
            const { movieId, date, show } = req.body;
            if (!movieId || !date || !Array.isArray(show) || show.length === 0 || !show.every(s => typeof s === "string")) {
                return res.status(400).json({ message: "Invalid input: movieId, date, and show are required, and show must be an array of strings." });
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
            const showDetails = await Shows.find({ _id: { $in: show } }).select('_id showName showTime');
            if (!showDetails || showDetails.length === 0) {
                return res.status(400).json({ message: "No valid shows found for the given IDs." });
            }
            const showNamesArray = showDetails.map(s => ({
                showId: s._id,
                showName: s.showName,
                showTime: s.showTime,
            }));
            const existingEntry = await datesAndShows.findOne({
                movie: movieId,
                date: formattedDate
            });
    
            if (existingEntry) {
                const existingShowIds = existingEntry.shows.map(s => s.showId.toString());
                const newShows = showNamesArray.filter(s => !existingShowIds.includes(s.showId.toString()));
    
                if (newShows.length > 0) {
                    existingEntry.shows.push(...newShows);
                    await existingEntry.save();
                    return res.status(200).json({ message: "Shows added to the existing entry." });
                } else {
                    return res.status(400).json({ message: "These shows are already added for the selected date." });
                }
            } else {
                await datesAndShows.create({
                    movie: movieId,
                    screen: movieExists.screen,
                    date: formattedDate,
                    shows: showNamesArray,
                });
                return res.status(200).json({ message: "Shows added successfully under the selected date." });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    



    ,
    updateDatesAndShows: async (req, res) => {
        try {
            const { dateId } = req.params;
            const { status } = req.body; 
            if (!status) {
                return res.status(400).json({ message: "Status is required." });
            }
            const existingEntry = await datesAndShows.findById(dateId);
            if (!existingEntry) {
                return res.status(400).json({ message: "No entry found with the provided dateId." });
            }
            const movieExists = await Movie.findById(existingEntry.movie);
            if (!movieExists) {
                return res.status(400).json({ message: "Invalid movie details." });
            }
            existingEntry.status = status;
            await existingEntry.save();
    
            return res.status(200).json({ message: "Status updated successfully." });
    
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    
    
    ,
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

            const showsByDate = await datesAndShows
                .find({ date: parsedDate })
                .populate('screen', '_id screenName seatLayoutStatus status')
                .populate('movie')
                .populate('show', 'showName showTime status')
                .sort({ createdAt: -1 });

            if (showsByDate.length === 0) {
                return res.status(400).json({ message: "No shows found for the given date" });
            }

            const formattedResponse = showsByDate.map(entry => {
                const formattedShows = entry.shows.map(show => ({
                    showId: show.showId,
                    showName: show.showName.join(", "),
                    _id: show._id,
                }));

                return {
                    screenId: entry.screen._id,
                    screenName: entry.screen.screenName,
                    movie: {
                        movieId: entry.movie._id,
                        movieName: entry.movie.movieName,
                        moviePoster: entry.movie.moviePoster,
                        movieGenre: entry.movie.movieGenre,
                        duration: entry.movie.duration,
                        censorship: entry.movie.censorship,
                        language: entry.movie.language,
                        status: entry.movie.status,
                    },
                    shows: formattedShows,
                    date: entry.date,
                    status: entry.status,
                };
            });

            return res.status(200).json({ dateBasedMovies: formattedResponse });

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
                    $match: { movie: new mongoose.Types.ObjectId(movieId) }
                },
                {
                    $unwind: "$shows" // Unwind the shows array
                },
                {
                    $lookup: {
                        from: "shows",
                        localField: "shows.showId",
                        foreignField: "_id",
                        as: "showDetails"
                    }
                },
                {
                    $unwind: "$showDetails" // Unwind the lookup result
                },
                // {
                //     $match: { "showDetails.status": "Active" }
                // },
                {
                    $group: {
                        _id: "$date",
                        totalShows: { $sum: 1 },
                        availableSlots: {
                            $sum: {
                                $cond: [{ $eq: ["$showDetails.status", "Active"] }, 1, 0]
                            }
                        },
                        showTimes: { $push: "$showDetails.showTime" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        totalShows: 1,
                        availableSlots: 1,
                        showTimes: 1
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

    ,

    deleteTimeSlot: async (req, res) => {
        try {
            const dateId = req.params.id;
            const datesAndShowsExists = await datesAndShows.findById(dateId);
            if (!datesAndShowsExists) {
                return res.status(404).json({ message: "Record not found." });
            }
            await datesAndShows.findByIdAndDelete(dateId);
            return res.status(200).json({ message: "Date and Time deleted successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}