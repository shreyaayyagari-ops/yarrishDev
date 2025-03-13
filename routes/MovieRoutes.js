const express = require("express");
const router = express.Router();

const MovieTheaterController = require('../Controllers/beatTheBox/MovieTheaterController');
const theaterPersonalDetailsController = require("../Controllers/beatTheBox/theaterPersonalDetailsController.js");
const authToken = require('../middleware/movieTheaterMiddleware');
const ScreenController = require('../Controllers/beatTheBox/ScreenControllers');
const SeatLayoutController = require('../Controllers/beatTheBox/seatLayoutController');
const MovieController = require('../Controllers/beatTheBox/MovieController');
const  ShowController = require('../Controllers/beatTheBox/ShoowControllers');
const crewController = require("../Controllers/beatTheBox/crewController.js");
// const CastandCrewController = require('../Controllers/beatTheBox/castAndCrewControllers');
// const DateController = require('../Controllers/beatTheBox/DateController');
const CastController = require("../Controllers/beatTheBox/CastController");
const datesAndShowsController = require("../Controllers/beatTheBox/datesAndShowsController.js");
const  CityController = require('../Controllers/beatTheBox/cityController.js');


//movie
router.post('/register', MovieTheaterController.register_movie);
router.post('/login', MovieTheaterController.login);
router.post('/Movie_details', authToken, MovieTheaterController.movie_Details);
router.post('/Bank_details', authToken, MovieTheaterController.bank_Details);
// router.patch('/update-bank/:id', authToken, MovieTheaterController.updateBankDetails);
router.post('/passord-verification', authToken, MovieTheaterController.change_Password_otp);
router.post('/verify-otp-movie', authToken, MovieTheaterController.verify_otp_movie);
router.post ('/change-password', authToken, MovieTheaterController.change_password);
router.get('/Profile',authToken, MovieTheaterController.Profile);
router.put('/update-profile', authToken, MovieTheaterController.updateProfile);
router.get('/get-moviedetails',authToken, MovieTheaterController.getMovieDetails);

//Screen
router.post('/create-screen',authToken, ScreenController.AddScreen); //validation for screen name pending
router.patch('/update-screen', authToken,ScreenController.updateScreen);//validation for screen name pending
router.get('/get-screens',authToken, ScreenController.getScreens );
router.post("/check_screen_name", authToken, ScreenController.checkScreenName);

//Seat Layout
// router.post("/seat-layout",authToken, SeatLayoutController.createSeatLayout);
// router.get("/seat-layout/:screenId",authToken, SeatLayoutController.getSeatLayout);
// router.patch("/seat-layout/:screenId",authToken, SeatLayoutController.updateSeatAvailability);

//show
router.post("/shows",authToken, ShowController.createShow);
router.put("/shows",authToken, ShowController.updateShow);
router.get("/get-shows/:id",authToken, ShowController.getAllShows);
router.post("/check_show_timing", authToken, ShowController.checkShowTiming);
// router.get('/getAllShows', authToken, ShowController.getShows);
// router.get("/get-shows/:id",authToken, ShowController.getShowById);

//Movie
router.post('/movies',authToken, MovieController.createMovie);
router.put('/update-movies',authToken, MovieController.updateMovie);
router.get('/get-movies/:id',authToken, MovieController.getMovies);
router.get('/singlemovie/:id',authToken, MovieController.getMovieById);

// cast
router.get('/cast/:id', authToken,CastController.getMovieCastMembers);
router.post('/cast', authToken,CastController.addCast);
router.patch('/cast', authToken,CastController.updateCast);
router.delete('/cast/:id', authToken,CastController.deleteCast);

//crew
router.get('/crew/:id', authToken,crewController.getMovieCrewMembers);
router.post('/crew', authToken,crewController.addCrew);
router.patch('/crew', authToken,crewController.updateCrew);
router.delete('/crew/:id', authToken,crewController.deleteCrew);


//date
// router.post('/add-date-movie',authToken, DateController.addMovieToDate);
// router.get('/available-show-timings/:date/:screenId', DateController.getAvailableShowTimings);
// router.get('/movies-by-date/:date', DateController.getMoviesByDate);

// time slots
router.get('/timeslots/:id', authToken,datesAndShowsController.getDatesAndShows);
router.post('/timeslots', authToken,datesAndShowsController.addDatesAndShows);
router.get('/updateTimeslots/:id',authToken,datesAndShowsController.updateDatesAndShows);
router.get('/dates_movies/:date',authToken,datesAndShowsController.dateBasedMovies);
router.get('/available_slots/:id',authToken,datesAndShowsController.availableSlots);
// router.delete('/delete-timeslot/:id',authToken,datesAndShowsController.deleteTimeSlot);

router.post('/updatemoviedetails', authToken, theaterPersonalDetailsController.update_movie_Details);
router.post('/updatebankdetails', authToken, theaterPersonalDetailsController.update_bank_Details);

router.get('/getCity', authToken, CityController.getCities);

router.get('/seats/:id', authToken, SeatLayoutController.screenBasedSeats);
router.post('/addseats', authToken, SeatLayoutController.addSeating);
router.post('/updateseats', authToken, SeatLayoutController.updateSeating);
router.get('/deleteseats/:id', authToken, SeatLayoutController.deleteSeating);

module.exports = router;