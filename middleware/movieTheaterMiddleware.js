const jwt = require('jsonwebtoken');
const MovieTheater = require('../Models/beatTheBox/movieTheater');

const authToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(400).json({ message: "Bearer token required" });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(400).json({ message: "Token not found" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if (!decoded) {
            return res.status(403).json({ message: "Invalid Token" });
        }
        const decodedId = decoded.id;
        const role = decoded.role;
        const movie = await MovieTheater.findById(decodedId);
        if (!movie) {
            return res.status(401).json({ message: "User not found" });
        }
        req.movieTheaterId = decodedId;
        req.role = role;
        req.movieDetails = movie;
        next();
    } catch (error) {
        console.error("Authentication error:", error.message);
        return res.status(500).json({ message: "Invalid Token" });
    }
}


module.exports = authToken;