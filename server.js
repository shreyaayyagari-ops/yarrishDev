const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const path = require('path');
const hbs = require('hbs');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const connectDatabase = require("./Config/DBconnect.js");
const mongoDBSession = require("connect-mongodb-session")(session);

const UserRoutes = require('./routes/UserRoutes.js');
const MovieRoutes = require('./routes/MovieRoutes.js');
const docsRoutes = require('./routes/adminRoutes/docsRoutes.js');

const adminAuthRouter = require("./routes/adminRoutes/adminAuthRouter.js");
const adminRouter = require("./routes/adminRoutes/adminRouter.js");
const MovieTicketsRoutes = require('./routes/MovieTicketsRoutes/movieTicketRoutes.js');

const { initScheduledJobs, initScheduledOtp } = require('./schedulers/schedulers.js');

const { isAdmin } = require("./middleware/authMiddleware.js");

const registerHelpers = require("./helpers/helpers.js");

connectDatabase();
initScheduledJobs();
initScheduledOtp();
registerHelpers();

const app = express();

const store = new mongoDBSession({
  uri: process.env.MONGO_URI,
  collection: "userSessions",
})

app.use(session({
  secret: "thisIsSecretKeyForADDTHEADD#1",
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 2
  },
  resave: false,
  saveUninitialized: false,
  store: store,
}));

app.use(flash());
app.use(fileUpload({
  limits: { fileSize: 200 * 1024 * 1024 }, // 50MB limit
}));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));


const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

//TEMPLATE ENGINE
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine("html", hbs.__express);
app.use(express.static(path.join(__dirname, "public")));
app.use('/images', express.static(path.join(__dirname, "images")));

hbs.registerPartials(path.join(__dirname, "views", "partials"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
  return res.redirect("/auth/login")
});

app.use("/auth", adminAuthRouter);
app.use("/admin", isAdmin, adminRouter);

//user routes
app.use('/api/v2', UserRoutes);

//Movie routes
app.use('/api/movie', MovieRoutes);

app.use('/settings', docsRoutes);
app.use('/movietickets', MovieTicketsRoutes);

const port = process.env.PORT || 80;

app.listen(port, async (req, res) => {
  console.log(`Server is running on port ${port}`);
});

process.env.TZ = "Asia/Calcutta";