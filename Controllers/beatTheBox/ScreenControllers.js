const Screen = require('../../Models/beatTheBox/screenModel');
const MovieTheater = require('../../Models/beatTheBox/movieTheater');
const jwt = require("jsonwebtoken");

module.exports = {
    AddScreen: async (req, res) => {
        try {
            const movieTheaterId = req.movieTheaterId;
            const { screenName, screenTotalColumns } = req.body;
            const existingMovieTheater = await MovieTheater.findById(movieTheaterId);
            if (!existingMovieTheater) {
                return res.status(404).json({ message: 'Movie Theater not found' });
            }
            if (!screenName) {
                return res.status(404).json({ message: 'Screen Name is required' });
            }
            if (!screenTotalColumns) {
                return res.status(404).json({ message: 'Columns count is required' });
            }
            const existingScreen = await Screen.findOne({
                screenName: screenName,
                movieTheater: movieTheaterId
            });
            if (existingScreen) {
                return res.status(400).json({ message: 'Screen Name already exists' });
            }
            await Screen.create({ screenName: screenName, screenTotalColumns: screenTotalColumns, movieTheater: movieTheaterId });
            res.status(201).json({ message: 'Screen created successfully' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    updateScreen: async (req, res) => {
        try {
            const movieTheaterId = req.movieTheaterId;
            const { screenName, screenTotalColumns, screenId, status } = req.body;
            const screenExists = await Screen.findById(screenId);
            if (!screenExists) {
                return res.status(400).json({ message: "Invalid screen details" });
            }
            if (screenName) {
                const existingScreen = await Screen.findOne({
                    screenName: screenName,
                    movieTheater: movieTheaterId
                });
                if (existingScreen) {
                    return res.status(400).json({ message: 'Screen Name already exists' });
                }
            }
            screenExists.screenName = screenName || screenExists.screenName;
            screenExists.screenTotalColumns = screenTotalColumns;
            screenExists.status = status || screenExists.status;
            await screenExists.save();
            return res.status(200).json({ message: "Updated successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    getScreens: async (req, res) => {
        try {
            const movieTheaterId = req.movieTheaterId;
            const allScreenDetails = await Screen.find({ movieTheater: movieTheaterId, status: 'Active' }).sort({ createdAt: -1 }).sort({ createdAt: -1 });
            if (!allScreenDetails) {
                return res.status(404).json({ message: "User not found" });
            }
            const allScreens = allScreenDetails.map((screen) => {
                return {
                    _id: screen._id,
                    screenName: screen.screenName,
                    screenTotalColumns: screen.screenTotalColumns,
                    status: screen.status,
                    seatLayoutStatus: screen.seatLayoutStatus
                }
            })
            return res.status(200).json({ allScreens });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    checkScreenName: async (req, res) => {
        try {
            const movieTheaterId = req.movieTheaterId;
            const { screenName } = req.body;
            if (!screenName) {
                return res.status(400).json({ message: "Screen Name is required" });
            }
            const lowerCaseScreenName = screenName.toLowerCase();
            const screens = await Screen.find({ movieTheater: movieTheaterId });
            const matchingScreen = screens.find(
                (screen) => screen.screenName.toLowerCase() === lowerCaseScreenName
            );
            if (!matchingScreen) {
                return res.status(200).json({ exists: false });
            } else {
                return res.status(400).json({ exists: true });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};