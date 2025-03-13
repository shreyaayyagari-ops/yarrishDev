const jwt = require("jsonwebtoken");

//generate token
exports.generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "364d"
    });
};