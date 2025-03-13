const Screen = require('../../Models/beatTheBox/screenModel');
const Show = require('../../Models/beatTheBox/showTiming');


module.exports = {
  createShow: async (req, res) => {
    try {
      const { showName, showTime, screenId } = req.body;
      const screenExists = await Screen.findById(screenId);
      if (!screenExists) {
        return res.status(404).json({ message: 'screen not found' });
      }
      const showNameInLowerCase = showName.toLowerCase();
      const showExistsByName = await Show.findOne({ showName: showNameInLowerCase, screenId });
      if (showExistsByName) {
        return res.status(400).json({ message: 'Show name already exists' });
      }
      const showExistsByTimeAndScreen = await Show.findOne({ showTime, screenId });
      if (showExistsByTimeAndScreen) {
        return res.status(400).json({ message: 'Show time already exists for this screen' });
      }
      await Show.create({ showName: showNameInLowerCase, showTime, screenId });
      return res.status(201).json({ message: "Show created successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  updateShow: async (req, res) => {
    try {
      const { showId, showTime, showName, status } = req.body;
      const show = await Show.findById(showId);
      if (!show) {
        return res.status(404).json({ error: "Show not found" });
      }
      if (showTime) {
        const showExistsByTimeAndScreen = await Show.findOne({ showTime, screenId: show.screenId });
        if (showExistsByTimeAndScreen) {
          return res.status(400).json({ message: 'Show time already exists for this screen' });
        }
        show.showTime = showTime || show.showTime;
      }
      if (showName) {
        const showNameInLowerCase = showName.toLowerCase();
        const showExists = await Show.findOne({ showName: showNameInLowerCase });
        if (showExists) {
          return res.status(400).json({ message: 'Show already exists' });
        }
        show.showName = showName || show.showName;
        show.status = status || show.status;
      }
      await show.save();
      return res.status(200).json({ message: "Show updated successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  getAllShows: async (req, res) => {
    try {
      const screenId = req.params.id;
      const shows = await Show.find({ screenId: screenId, status: 'Active' }).sort({ createdAt: -1 });
      return res.status(200).json({ shows });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  checkShowTiming: async (req, res) => {
    try {
      const { screenId, showTime } = req.body;
      if (!showTime) {
        return res.status(404).json({ error: "Missing fields required" });
      }
      const showExists = await Show.findOne({ screenId: screenId, showTime: showTime });
      if (!showExists) {
        return res.status(200).json({ exists: false });
      } else {
        return res.status(400).json({ exists: true });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // getShows: async (req, res) => {
  //   try{
  //     const movieTheaterId = req.movieTheaterId;
  //     const shows = await Show.find({movieTheaterId:movieTheaterId, status: 'Active'}).sort({createdAt: -1});
  //     return res.status(200).json({shows});
  //   } catch (error) {
  //     return res.status(500).json({error: "Failed to fetch shows"});
  //   }
  // },

  // getShowById: async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const show = await Show.findById(id).populate("screenId").exec();

  //     if (!show) {
  //       return res.status(404).json({ error: "Show not found" });
  //     }

  //     return res.status(200).json({ show });
  //   } catch (error) {
  //     return res.status(500).json({ error: "Failed to fetch show" });
  //   }
  // }
}