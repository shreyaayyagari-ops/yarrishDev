const crew = require("../../Models/beatTheBox/crewModel.js");
const Movie = require("../../Models/beatTheBox/Movie.js");

const { uploadFile, deleteFile } = require("../../middleware/awsMiddleware.js");

module.exports = {
    getMovieCrewMembers: async (req, res) => {
        try {
            const movieId = req.params.id;
            const movieCrewMembers = await crew.find({ movieId: movieId }).sort({ createdAt: -1 });
            return res.status(200).json({ movieCrewMembers });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },
    addCrew: async (req, res) => {
        try {
            const { movieId, name, designation } = req.body;
            const picture = req.files ? req.files.picture : null;
            if (!movieId || !name || !designation) {
                return res.status(400).json({ message: 'Missing required fileds' });
            }
            if (!picture) {
                return res.status(400).json({ message: 'Invalid picture' })
            }
            const movieExists = await Movie.findById(movieId);
            if (!movieExists) {
                return res.status(400).json({ message: 'Invalid movie details' });
            }
            const uploadedPicture = await uploadFile(picture, "yaarish", "Crew");
            if (!uploadedPicture) {
                return res.status(400).json({ meesage: "Invalid picture" })
            }
            await crew.create({ movieId: movieId, name, designation, picture: uploadedPicture });
            return res.status(200).json({ message: "Crew member added successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },
    updateCrew: async (req, res) => {
        try {
            const { crewId, name, designation } = req.body;
            const picture = req.files ? req.files.picture : null;
            if (!crewId) {
                return res.status(400).json({ message: 'Crew ID is required' });
            }
            const crewExists = await crew.findById(crewId);
            if (!crewExists) {
                return res.status(400).json({ message: 'Invalid crew details' });
            }
            if (picture) {
                await deleteFile(crewExists.picture, "yaarish", "Crew");
                const uploadedPicture = await uploadFile(picture, "yaarish", "Crew");
                crewExists.picture = uploadedPicture;
            }
            crewExists.name = name || crewExists.name;
            crewExists.designation = designation || crewExists.designation;
            await crewExists.save();
            return res.status(200).json({ message: "Updated successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },
    deleteCrew: async (req, res) => {
        try {
            const crewId = req.params.id;
            if (!crewId) {
                return res.status(400).json({ message: "Invalid crew Id" });
            }
            const crewExists = await crew.findById(crewId);
            if (!crewExists) {
                return res.status(400).json({ message: "Invalid crew details" });
            }
            await deleteFile(crewExists.picture, "yaarish", "Crew");
            await crew.findByIdAndDelete(crewId);
            return res.status(200).json({ message: "Crew member deleted successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}