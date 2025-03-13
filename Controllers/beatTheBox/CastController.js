const cast = require("../../Models/beatTheBox/castModel.js");
const Movie = require("../../Models/beatTheBox/Movie.js");

const { uploadFile, deleteFile } = require("../../middleware/awsMiddleware.js");

module.exports = {
    getMovieCastMembers: async (req, res) => {
        try {
            const movieId = req.params.id;
            const movieCastMembers = await cast.find({ movieId: movieId }).sort({ createdAt: -1 });
            return res.status(200).json({ movieCastMembers });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    addCast: async (req, res) => {
        try {
            const { movieId, name, nameInMovie } = req.body;
            const picture = req.files ? req.files.picture : null;
            if (!movieId || !name || !nameInMovie) {
                return res.status(400).json({ message: 'Missing required fileds' });
            }
            if (!picture) {
                return res.status(400).json({ message: 'Invalid picture' })
            }
            const movieExists = await Movie.findById(movieId);
            if (!movieExists) {
                return res.status(400).json({ message: 'Invalid movie details' });
            }
            const uploadedPicture = await uploadFile(picture, "yaarish", "Cast");
            if (!uploadedPicture) {
                return res.status(400).json({ meesage: "Invalid picture" })
            }
            await cast.create({ movieId: movieId, name, nameInMovie, picture: uploadedPicture });
            return res.status(200).json({ message: "Cast member added successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    updateCast: async (req, res) => {
        try {
            const { castId, name, nameInMovie } = req.body;
            const picture = req.files ? req.files.picture : null;
            if (!castId) {
                return res.status(400).json({ message: 'Cast ID is required' });
            }
            const castExists = await cast.findById(castId);
            if (!castExists) {
                return res.status(400).json({ message: 'Invalid cast details' });
            }
            if (picture) {
                await deleteFile(castExists.picture, "yaarish", "Cast");
                const uploadedPicture = await uploadFile(picture, "yaarish", "Cast");
                castExists.picture = uploadedPicture;
            }
            castExists.name = name || castExists.name;
            castExists.nameInMovie = nameInMovie || castExists.nameInMovie;
            await castExists.save();
            return res.status(200).json({ message: "Updated successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    deleteCast: async (req, res) => {
        try {
            const castId = req.params.id;
            if (!castId) {
                return res.status(400).json({ message: "Invalid cast Id" });
            }
            const castExists = await cast.findById(castId);
            if (!castExists) {
                return res.status(400).json({ message: "Invalid cast details" });
            }
            await deleteFile(castExists.picture, "yaarish", "Cast");
            await cast.findByIdAndDelete(castId);
            return res.status(200).json({ message: "Cast member deleted successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}