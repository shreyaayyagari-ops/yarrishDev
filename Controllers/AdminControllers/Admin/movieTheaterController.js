const MovieTheater = require('../../../Models/beatTheBox/movieTheater');
const Executive = require('../../../Models/Executive');
const bcrypt = require('bcrypt');
// const { body, validationResult } = require('express-validator');


module.exports = {

    movie_theater: async (req, res) => {
        try {
            const movieTheater = await MovieTheater.find().sort({ createdAt: -1 });
            const executives = await Executive.find({}, 'name _id');
            // console.log(executives);
            return res.render("movieTheater", {
                allmovieTheater: movieTheater,
                executives: executives,
                success: req.flash("success"),
                error: req.flash("error"),
            });
        } catch (error) {
            console.error("Error in movie_theater function:", error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    },
    addMovieTheater: async (req, res) => {
        try {
            const { movieTheaterOwnerName, movieTheaterName, email, phoneNumber, password, executiveId } = req.body;
            if (!movieTheaterOwnerName || !movieTheaterName || !email || !phoneNumber || !executiveId || !password) {
                req.flash('error', 'All fields are required');
                return res.redirect('/admin/movieTheater');
            }
            const theaterExistsByPhone = await MovieTheater.findOne({ phoneNumber: phoneNumber });
            const theaterExistsByEmail = await MovieTheater.findOne({ email: email });
            if (theaterExistsByPhone) {
                req.flash('error', 'Mobile number already exists');
                return res.redirect('/admin/movieTheater');
            }
            if (theaterExistsByEmail) {
                req.flash('error', 'Email already exists');
                return res.redirect('/admin/movieTheater');
            }
            const executiveExists = await Executive.findById(executiveId);
            if (!executiveExists) {
                req.flash('error', 'Invalid executive details');
                return res.redirect('/admin/movieTheater');
            }
            const newTheater = await MovieTheater.create({
                movieTheaterOwnerName, movieTheaterName, email, phoneNumber, password,
                executive: executiveId, executiveName: executiveExists.name, executiveEmail: executiveExists.email, executiveNumber: executiveExists.phone
            });
            if (!newTheater) {
                req.flash('error', 'Error while creating new theater');
                return res.redirect('/admin/movieTheater');
            }
            req.flash("success", "Movie theater added successfully");
            return res.redirect("/admin/movieTheater");
        } catch (error) {
            console.error("Error in movie_theater function:", error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    },
    singleMovieTheater: async (req, res) => {
        try {
            const theaterId = req.params.id;
            const singleTheater = await MovieTheater.findById(theaterId);
            return res.render("singleTheater", {
                singleTheater: singleTheater,
                success: req.flash("success"),
                error: req.flash("error"),
            })
        } catch (error) {
            console.error("Error in movie_theater function:", error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    }


    // storeMovieTheater: async (req, res) => {
    //     try {

    //         const existingUser = await MovieTheater.findOne({ email_id });
    //         if (existingUser) {
    //             req.flash('error', 'Movie theater admin with this email already exists');
    //             return res.redirect('/admin/movieTheater');
    //         }
    //         const generatedPassword = await generateRandomPassword();
    //         const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    //         const newMovieTheater = new MovieTheater({
    //             Movie_theater_name,
    //             email_id,
    //             phone_number,
    //             password: hashedPassword,
    //             role: 'movie_theater',
    //             Executive,
    //         });

    //         await newMovieTheater.save();

    //         await sendMailCredentials(email_id, Movie_theater_name, generatedPassword);

    //         req.flash('success', 'New admin added successfully');
    //         return res.redirect('/admin/movieTheater');
    //     } catch (error) {
    //         console.log(error);
    //         req.flash('error', 'Internal server error');
    //         return res.redirect('/admin/movieTheater');
    //     }
    // },


    // updateMovieTheater: async (req, res) => {
    //     try {
    //         const movieTheaterId = req.params.id;
    //         const updateData = req.body;
    //         const movieTheater = await MovieTheater.findOneAndUpdate(
    //             { _id: movieTheaterId, role: 'movie_theater' },
    //             updateData,
    //             { new: true }
    //         );

    //         if (!movieTheater) {
    //             req.flash('error', "Movie Theater not found");
    //             return res.redirect('/admin/movieTheater');
    //         }

    //         req.flash("success", "Movie Theater updated successfully");
    //         return res.redirect("/admin/movieTheater");

    //     } catch (error) {
    //         req.flash('error', "Internal server error ");
    //         return res.redirect('/admin/movieTheater');
    //     }
    // },

    // deleteMovieTheater: async (req, res) => {
    //     try {
    //         const movieTheaterId = req.params.id;

    //         const movieTheater = await MovieTheater.findOneAndDelete({ _id: movieTheaterId, role: 'movie_theater' });

    //         if (!movieTheater) {
    //             req.flash("error", "Movie Theater not found");
    //             return res.redirect("/admin/Admin");
    //         }

    //         req.flash("success", "Movie Theater deleted successfully");
    //         return res.redirect("/admin/movieTheater");
    //     } catch (error) {
    //         req.flash("error", "Internal server error");
    //         return res.redirect("/admin/movieTheater");
    //     }
    // },

}