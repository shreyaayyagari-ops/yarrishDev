const express = require("express");
const router = express.Router();
const userMovieController = require('../../Controllers/MovieTickets/userMovieController');
const {auth} = require('../../middleware/authMiddlewares');


router.get('/cities',auth, userMovieController.getCities);
router.get('/citites/:id',auth, userMovieController.getMoviesByCitites);
router.get('/comingsoon',auth, userMovieController.comingSoonMovies);
router.get('/datesAndShows/:id',auth, userMovieController.getDatesAndShows);
router.get('/seatsByScreen/:id', auth, userMovieController.screenBasedSeats);

//Book Ticket
router.post('/bookTicket',auth, userMovieController.bookTicket);
router.get('/getBookedTickets',auth, userMovieController.getBookedTickets);

//payment
router.post('/creatOrder',auth, userMovieController.createOrder);





module.exports = router;