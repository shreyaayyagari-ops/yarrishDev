const mongoose = require("mongoose");

const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
        })
            .then(() => {
                console.log("Database Connected")
                return
            })
            .catch(() => {
                return
            })
    }
    catch (error) {
        console.log(error)
    }
};

module.exports = connectDatabase;