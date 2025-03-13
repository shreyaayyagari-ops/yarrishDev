const Time = require('../../../Models/timeModel');

module.exports = {


    time: async (req, res) => {
        const alltime = await Time.find().sort({ time: 1 });
        //console.log("All countries:", allCountries);
        return res.render('alltime', {
            alltime: alltime,
            success: req.flash("success"),
            error: req.flash("error"),
        });
    },
//

    // createTimeEntry: async (req, res) => {
    //     try {
    //         const { time } = req.body;
    //         if (!time) {
    //             req.flash("error", "All fields are required");
    //             return res.redirect('/admin/time');
    //         }

    //         const newTimeSlot = new Time({ time });
    //         await newTimeSlot.save();

    //         req.flash("success", "Time slot created successfully");
    //         return res.redirect('/admin/time');
    //     } catch (error) {
    //         req.flash("error", error.message);
    //         return res.redirect('/admin/time');
    //     }
    // },
    addTime: async (req, res) => {
        try {
            const { time } = req.body;
            if (!time) {
                return res.status(400).json({ message: 'Please select Time Slots' });
            }
            // let hour = parseInt(time);
            // let minuteValue = parseInt(minute);

            // if (meridian === 'PM' && hour !== 12) {
            //     hour += 12;
            // } else if (meridian === 'AM' && hour === 12) {
            //     hour = 0;
            // }
            // const formattedTime = `${hour.toString().padStart(2, '0')}:${minuteValue.toString().padStart(2, '0')}`;
            // const newTime = new Time({ time: formattedTime });
            // await newTime.save();
            //
            
            const newTime = await Time.create({ time });
            req.flash("success", "Time slot Added successfully");
            return res.redirect('/admin/time');
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error adding time', error: error.message });
            return res.redirect('/admin/time');
        }
    },

    deleteTime: async (req, res) => {
        try {
            const { id } = req.params;
            await Time.findByIdAndDelete(id);
            req.flash("success", "Time slot deleted successfully");
            return res.redirect('/admin/time');
        } catch (error) {
            console.error(error);
            req.flash("error", error.message);
            return res.redirect('/admin/time');
        }
    },
}