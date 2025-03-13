const mongoose = require('mongoose');
const Time = require('../../Models/timeModel'); 
const moment = require('moment');

module.exports = {
    createTimeEntry: async (req, res) => {
        try {
            const { time } = req.body;
    
          //console.log(time)
            if (time && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
                return res.status(400).json({ message: `${time} is not a valid time format! Please use HH:mm format.` });
            }
    
          
            const newTimeSlot = new Time({ time });
            await newTimeSlot.save();
    
            
            return res.status(201).json({
                message: "Time slot created successfully",
                timeSlot: {
                    time: newTimeSlot.time,  
                    _id: newTimeSlot._id     
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },


getDates: async (req, res) => {
    try {

        const dateDocuments = await Date.find({ date: { $ne: null } }).select('date _id');
        const dateSlots = dateDocuments.map(doc => ({
            date: doc.date,
            _id: doc._id
        }));

        return res.status(200).json({
            message: 'Dates retrieved successfully',
            dateSlots
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
},

getTimeSlots: async (req, res) => {
    try {
        const timeDocuments = await Time.find({ time: { $ne: "" } }).select('time _id').sort({ createdAt:-1 });;


        const timeSlots = timeDocuments.map(doc => ({
            time: doc.time,
            _id: doc._id
        }));

        return res.status(200).json({
            message: 'Time slots retrieved successfully',
            timeSlots
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
},


getTimeById: async (req, res) => {
    try {
        const { id } = req.params;
        const time = await Time.findById(id).select('_id time');



        if (!time) {
            return res.status(404).json({ message: 'Time slot not found' });


        }

        return res.status(200).json({
            message: 'Time slot retrieved successfully',
            timeSlot: {
                time: time.time,
                _id: time._id
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
},

getDateById: async (req, res) => {
    try {
        const { id } = req.params;
        const dateDocument = await Date.findById(id).select('date _id');


        if (!dateDocument) {
            return res.status(404).json({ message: 'Date not found' });
        }

        return res.status(200).json({
            message: 'Date retrieved successfully',
            date: {
                date: dateDocument.date,
                _id: dateDocument._id
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
};