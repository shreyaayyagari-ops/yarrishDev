const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');


const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(400).json({ message: "Bearer token required" });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(400).json({ message: "Token not found" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(403).json({ message: "Invalid Token" });
        }
        const decodedId = decoded.id;
        const role = decoded.role;
        const userExists = await User.findById(decodedId);
        if (!userExists) {
            return res.status(401).json({ message: "User not found" });
        }
        req.userId = decodedId;
        req.role = role;
        next();
    } catch (error) {
        console.error("Authentication error:", error.message);
        return res.status(500).json({ message: "Invalid Token" });
    }
}

const serviceProviderAuthorization = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(400).json({ message: "Bearer token required" });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(400).json({ message: "Token not found" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(403).json({ message: "Invalid Token" });
        }
        const decodedId = decoded.id;
        const role = decoded.role;
        const userExists = await User.findById(decodedId);
        if (!userExists) {
            return res.status(401).json({ message: "User not found" });
        }
        if (!userExists.subscription_status) {
            return res.status(407).json({ message: "Please purchase subscription" }); //407 -> redirect to subscription screens
        }
        req.userId = decodedId;
        req.role = role;
        next();
    } catch (error) {
        console.error("Authentication error:", error.message);
        return res.status(500).json({ message: "Invalid Token" });
    }
}


module.exports = { auth, serviceProviderAuthorization };
