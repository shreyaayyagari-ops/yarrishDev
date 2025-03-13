const Movie = require('../../Models/beatTheBox/Movie');
const MovieTheater = require('../../Models/beatTheBox/movieTheater');
const datesAndShows = require('../../Models/beatTheBox/datesAndShows');
const City = require('../../Models/beatTheBox/city');
const Screen = require('../../Models/beatTheBox/screenModel');
const Show = require('../../Models/beatTheBox/showTiming');
const Ticket = require('../../Models/beatTheBox/Ticket');
const User = require('../../Models/userModel');
const TicketOrder = require('../../Models/beatTheBox/ticketOrder');
const crypto = require('crypto');

module.exports = {
    getCities: async (req, res) => {
        try{
            const allCities = await City.find({status: 'Active'}).sort({createdAt: -1});
            if(!allCities){
                return res.status(404).json({message: 'No city found'});
            }   
            return res.status(200).json({allCities});
          } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    //

    getMoviesByCitites: async (req, res) => {
        try {
          const cityId = req.params.id;
          if (!cityId) {
            return res.status(400).json({ meesage: "Invalid screen Id" });
          }
          const movies = await Movie.find({ location: cityId, status: 'Active' }).sort({ createdAt: -1 });
          return res.status(200).json({ movies });
        } catch (error) {
          console.log(error);
          return res.status(500).json({ message: 'Internal Server Error' });
      }
      },

      comingSoonMovies: async (req, res) => {
        try {
          const comingsoon = await Movie.find({
              _id: { $nin: await datesAndShows.distinct('movie') }
          });
          res.status(200).json({ success: true, movies: comingsoon });
        } catch (error) {
          console.log(error);
          return res.status(500).json({ message: 'Internal Server Error' });
      }
  },

  getDatesAndShows: async (req, res) => {
    try {
        const movieId = req.params.id;
        if (!movieId) {
            return res.status(400).json({ message: "Invalid movie Id" });
        }
        const movieExists = await Movie.findById(movieId);
        if (!movieExists) {
            return res.status(400).json({ message: "Invalid movie details" });
        }
        const datesAndTimes = await datesAndShows.find({ movie: movieId }).populate("show");
        return res.status(200).json({ datesAndTimes });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
},

screenBasedSeats: async (req, res) => {
  try {
      const screenId = req.params.id;
      if (!screenId) {
          return res.status(400).json({ message: "Invalid screen Id" });
      }
      const screenExists = await Screen.findById(screenId);
      if (!screenExists) {
          return res.status(400).json({ message: "Invalid screen details" });
      }
      return res.status(200).json({ seatsLayout: screenExists.seatTypes })
  } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
},


bookTicket: async (req, res) => {
  try {
    const { movieId, movieTheaterId, showId, seats } = req.body;
    if (!movieId || !movieTheaterId || !showId || !seats || !seats.length) {
      return res.status(400).json({ message: 'Missing required fields or seats' });
    }
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    const movieTheaters = await MovieTheater.findById(movieTheaterId);
    if (!movieTheaters) {
      return res.status(404).json({ message: 'Movie Theater not found' });
    }
    const show = await Show.findById(showId).populate('screenId');
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }
    const screen = await Screen.findById(show.screenId);
    if (!screen) {
      return res.status(404).json({ message: 'Screen not found' });
    }
    const tickets = seats.map((seat) => ({
      Price: screen.seatTypes.find(type => type.seatingPosition === seat.seatType)?.price || 0,
      SeatNo: seat.seats,
      TicketStatus: 'selected',
      movie: movieId,
      movieName: movie.movieName,
      movieGenre: movie.movieGenre,
      show: showId,
      showName: show.showName,
      showTime: show.showTime,
      date: show.date,
      dateAndTime: `${show.date} ${show.showTime}`,
      screen: show.screenId,
      screenName: screen.screenName,
      movieTheater: movieTheaterId,
      movieTheaterName: movieTheaters.movieTheaterName,
      location: movieTheaters.location,
    }));
    const savedTickets = await Ticket.insertMany(tickets);
    return res.status(201).json({
      message: 'Tickets booked successfully',
      savedTickets,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server Error' });
}
},

getBookedTickets: async (req, res) => {
  try {
    const tickets = await Ticket.find();
    return res.status(200).json({ tickets });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server Error' });
}
},

createOrder: async (req, res) => {
  try {
    const userId = req.userId
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const { TicketId } = req.body;
    if (!TicketId) {
      return res.status(400).json({ message: 'Ticket ID is required' });
    }
    const ticket = await Ticket.findById(TicketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const payuConfig = {
      merchantKey: '8606337',
      salt: 'BuoA4HAo4GIZ5AvMYRPVyFX80sDSrWxg',
      authUrl: 'https://test.payu.in/_payment', // Sandbox URL for testing
    };
    const Price = parseFloat(ticket.Price);
    const txnId = `Txn${Date.now()}`;
    const hashString = `${payuConfig.merchantKey}|${txnId}|${Price}|${ticket.movieName}|user@example.com|||||||||||${payuConfig.salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');
    const order = new TicketOrder({
     
      user: userId,  key: payuConfig.merchantKey,
      userName: user.name,
      userPhone: user.phone,
      tickets: [ticket._id],
      movie: ticket.movie,
      show: ticket.show, 
      seatNo: ticket.SeatNo,
      price: Price,
      status: 'pending',
      orderId: txnId,
      surl: `${baseUrl}/payu/success`,
      furl: `${baseUrl}/payu/failure`,
    });
    const savedOrder = await order.save();
    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: savedOrder,
      paymentUrl: payuConfig.authUrl,
      hash,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
},

verifyOrder: async (req, res) => {
  try{
    const {txnid, status, amount, hash} = req.body;
    if(!txnid || !status || !amount || !hash){
      return res.status(400).json({message: 'Missing required fields'});
    }
    const order = await TicketOrder.findOne({orderId: txnid});
    if(!order){
      return res.status(404).json({message: 'Order not found'});
    }
    const payuConfig = {
      merchantKey: '8606337',
      salt: 'BuoA4HAo4GIZ5AvMYRPVyFX80sDSrWxg',
      authUrl: 'https://test.payu.in/_payment', // Sandbox URL for testing
    };
    const hashString = `${payuConfig.salt}|${status}||||||||||${amount}|${order.price}|${order.movieName}|${order.key}`;
    const generatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
    if(hash !== generatedHash){
      return res.status(400).json({message: 'Invalid hash'});
    }
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
};