const { uploadFile } = require("../../middleware/awsMiddleware");
const movieTheater = require("../../Models/beatTheBox/movieTheater");
const City = require("../../Models/beatTheBox/city");

module.exports = {
    update_movie_Details: async (req, res) => {
        try {
            const movieTheaterId = req.movieTheaterId;
            console.log(req.body);
            console.log(movieTheaterId)
            const existingMovieTheater = await movieTheater.findById(movieTheaterId);
            if (!existingMovieTheater) {
                return res.status(404).json({ message: "Movie Theater not found." });
            }
            const { movieTheaterName, location, Area, Address, latitude, longitude } = req.body;
            const theaterLogo = req.files ? req.files.theaterLogo : null;
            if (location) {
                const cityDetails = await City.findById(location);
                if (!cityDetails) {
                    return res.status(404).json({ message: 'City not found' });
                }
                existingMovieTheater.location = location;
                existingMovieTheater.cityName = cityDetails.cityName; // Update cityName
            }
            if (theaterLogo) {
                const logo = await uploadFile(theaterLogo, "yaarish", "MovieDetails");
                if (!logo) {
                    return res.status(400).json({ meesage: "Invalid Logo" })
                }
                existingMovieTheater.theaterLogo = logo;
            }
            existingMovieTheater.movieTheaterName = movieTheaterName || existingMovieTheater.movieTheaterName;
            existingMovieTheater.location = location || existingMovieTheater.location;
            existingMovieTheater.Area = Area || existingMovieTheater.Area;
            existingMovieTheater.Address = Address || existingMovieTheater.Address;
            existingMovieTheater.latitude = latitude || existingMovieTheater.latitude;
            existingMovieTheater.longitude = longitude || existingMovieTheater.longitude;
            await existingMovieTheater.save();
            return res.status(200).json({ message: "Updated successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    update_bank_Details: async (req, res) => {
        try {
            const movieTheaterId = req.movieTheaterId;
            const { bankName, accountNumber, accountType, Branch, IFSC_code } = req.body;
            const existingMovieTheater = await movieTheater.findById(movieTheaterId);
            if (!existingMovieTheater) {
                return res.status(404).json({ message: "Movie Theater not found." });
            }
            existingMovieTheater.bankName = bankName || existingMovieTheater.bankName;
            existingMovieTheater.accountNumber = accountNumber || existingMovieTheater.accountNumber;
            existingMovieTheater.accountType = accountType || existingMovieTheater.accountType;
            existingMovieTheater.Branch = Branch || existingMovieTheater.Branch;
            existingMovieTheater.IFSC_code = IFSC_code || existingMovieTheater.IFSC_code;
            await existingMovieTheater.save();
            return res.status(200).json({ message: "Updated successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
}