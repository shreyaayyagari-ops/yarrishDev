const Screen = require('../../Models/beatTheBox/screenModel');
const seatLayout = require('../../Models/beatTheBox/seatModel');

module.exports = {
    screenBasedSeats: async (req, res) => {
        try {
            const screenId = req.params.id;
            if (!screenId) {
                return res.status(400).json({ message: "Invalid screen Id" });
            }
            const seatLayoutExists = await seatLayout.find({ screenId: screenId });
            if (!seatLayoutExists) {
                return res.status(400).json({ message: "Invalid screen details" });
            }
            return res.status(200).json({ seatLayoutExists });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    addSeating: async (req, res) => {
        try {
            const { screenId, seatType, seatingPosition, price, rows } = req.body;
            if (!screenId) {
                return res.status(400).json({ message: "Invalid screen Id" });
            }
            const screenExists = await Screen.findById(screenId);
            if (!screenExists) {
                return res.status(400).json({ message: "Invalid screen details" });
            }
            const positionExists = await seatLayout.findOne({ screenId: screenId, seatingPosition: seatingPosition });
            if (positionExists) {
                return res.status(400).json({ message: "Seating Type Positon is already occupied" });
            }
            const newSeatLayout = await seatLayout.create({ screenId, seatType, seatingPosition, price, rows });
            if (!screenExists.seatLayoutStatus) {
                screenExists.seatLayoutStatus = true;
            }
            screenExists.seatTypes.push(newSeatLayout._id);
            await screenExists.save();
            return res.status(200).json({ message: "Seats added successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    updateSeating: async (req, res) => {
        try {
            const { seatLayoutId, seatType, seatingPosition, price, rows } = req.body;
            if (!seatLayoutId) {
                return res.status(400).json({ message: "Invalid seat layout Id" });
            }
            const seatLayoutExists = await seatLayout.findById(seatLayoutId);
            if (!seatLayoutExists) {
                return res.status(400).json({ message: "Invalid seat details" });
            }
            seatLayoutExists.seatType = seatType || seatLayoutExists.seatType;
            seatLayoutExists.price = price || seatLayoutExists.price;
            if (seatingPosition) {
                const seatPositionExists = await seatLayout.findOne({ screenId: seatLayoutExists.screenId, seatingPosition: seatingPosition });
                if (!seatPositionExists) {
                    seatLayoutExists.seatingPosition = seatingPosition || seatLayoutExists.seatingPosition;
                } else {
                    if (seatingPosition === seatLayoutExists.seatingPosition) {
                        seatLayoutExists.seatingPosition = seatingPosition || seatLayoutExists.seatingPosition;
                    } else {
                        return res.status(400).json({ message: "Seating position is already existed" });
                    }
                }
            }
            seatLayoutExists.rows = rows || seatLayoutExists.rows;
            await seatLayoutExists.save();
            return res.status(200).json({ message: "Layout updated successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    deleteSeating: async (req, res) => {
        try {
            const seatLayoutId = req.params.id;
            if (!seatLayoutId) {
                return res.status(400).json({ message: "Invalid seat layout Id" });
            }
            const seatLayoutExists = await seatLayout.findById(seatLayoutId);
            if (!seatLayoutExists) {
                return res.status(400).json({ message: "Invalid seat details" });
            }
            const screenExists = await Screen.findById(seatLayoutExists.screenId);
            if (!screenExists) {
                return res.status(400).json({ message: "Associated screen not found" });
            }
            if (screenExists.seatTypes.includes(seatLayoutExists._id)) {
                screenExists.seatTypes.pull(seatLayoutExists._id);
                await screenExists.save();
                if(screenExists.seatTypes.length === 0) {
                    
                }
            }
            await seatLayout.findByIdAndDelete(seatLayoutId);    
            return res.status(200).json({ message: "Seat deleted successfully" });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}