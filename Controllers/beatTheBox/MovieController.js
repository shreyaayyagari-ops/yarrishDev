const Movie = require('../../Models/beatTheBox/Movie.js');
const MovieTheater = require('../../Models/beatTheBox/movieTheater.js');
const City = require('../../Models/beatTheBox/city.js');
const Screen = require('../../Models/beatTheBox/screenModel.js');
const { uploadFile, deleteFile } = require("../../middleware/awsMiddleware.js");

module.exports = {
  createMovie: async (req, res) => {
    try {
      const movieTheaterId = req.movieTheaterId;
      const existingMovieTheater = await MovieTheater.findById(movieTheaterId);
      if (!existingMovieTheater) {
        return res.status(404).json({ message: "Movie Theater not found." });
      }

      const { movieName, movieGenre, duration, censorship, language, screenId } = req.body;
      if (!movieName || !movieGenre || !duration || !censorship || !language || !screenId) {
        return res.status(400).json({ message: 'Missing required fileds' });
      }
      const moviePoster = req.files ? req.files.moviePoster : null;
      if (!moviePoster) {
        return res.status(400).json({ message: 'Invalid Poster' })
      }
      const screenExists = await Screen.findById(screenId);
      if (!screenExists) {
        return res.status(400).json({ meesage: "Invalid screen details" });
      }
      const poster = await uploadFile(moviePoster, "yaarish", "Movie");
      if (!poster) {
        return res.status(400).json({ meesage: "Invalid poster" })
      }
      await Movie.create({ movieName, movieGenre, duration, censorship, language, moviePoster: poster, screen: screenId, location: existingMovieTheater.location });
      res.status(201).json({ message: 'Movie created successfully' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  updateMovie: async (req, res) => {
    try {
      const { movieName, movieGenre, duration, censorship, language, status, movieId } = req.body;
      const moviePoster = req.files ? req.files.moviePoster : null;
      const movieExists = await Movie.findById(movieId);
      if (!movieExists) {
        return res.status(400).json({ meesage: "Invalid movie details" });
      }
      movieExists.movieName = movieName || movieExists.movieName;
      movieExists.movieGenre = movieGenre || movieExists.movieGenre;
      movieExists.duration = duration || movieExists.duration;
      movieExists.censorship = censorship || movieExists.censorship;
      movieExists.language = language || movieExists.language;
      movieExists.status = status || movieExists.status;
      if (moviePoster) {
        await deleteFile(movieExists.moviePoster, "yaarish", "Movie");
        const poster = await uploadFile(moviePoster, "yaarish", "Movie");
        movieExists.moviePoster = poster;
      }
      await movieExists.save();
      return res.status(200).json({ message: 'Movie updated successfully' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  getMovies: async (req, res) => {
    try {
      const screenId = req.params.id;
      if (!screenId) {
        return res.status(400).json({ meesage: "Invalid screen Id" });
      }
      const allMovies = await Movie.find({ screen: screenId }).populate("location").sort({ createdAt: -1 });
      const movies = allMovies.map((movie) => {
        return {
          _id: movie._id,
          movieName: movie.movieName,
          moviePoster: movie.moviePoster,
          movieGenre: movie.movieGenre,
          duration: movie.duration,
          censorship: movie.censorship,
          language: movie.language,
          status: movie.status,
          location: movie.location,
        }
      });
      return res.status(200).json({ movies });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  getMovieById: async (req, res) => {
    try {
      const movieId = req.params.id;
      const movieDetails = await Movie.findById(movieId);
      if (!movieDetails) {
        return res.status(404).json({ message: 'Movie not found' });
      }
      const movie = {
        _id: movieDetails._id,
        movieName: movieDetails.movieName,
        moviePoster: movieDetails.moviePoster,
        movieGenre: movieDetails.movieGenre,
        duration: movieDetails.duration,
        censorship: movieDetails.censorship,
        language: movieDetails.language,
        status: movieDetails.status,
        location: movieDetails.location,
      }
      return res.status(200).json({ movie });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
}