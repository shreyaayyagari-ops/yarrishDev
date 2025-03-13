 const adminRouter = require("express").Router();

const adminController = require("../../Controllers/AdminControllers/adminController");
const CategoryController = require('../../Controllers/AdminControllers/Admin/CategoryController');
const CountryController = require('../../Controllers/AdminControllers/CountryController');
const ServiceController = require('../../Controllers/AdminControllers/Admin/ServiceController');
const SubscriptionController = require('../../Controllers/AdminControllers/Admin/SubscriptionController');
const settingsController = require('../../Controllers/AdminControllers/Admin/ContentController');
const BannerController = require('../../Controllers/AdminControllers/Admin/bannerController');
const NotificationController = require('../../Controllers/AdminControllers/Admin/NotificationController');
const executiveController = require('../../Controllers/AdminControllers/Admin/executiveController');
const movieTheaterController = require('../../Controllers/AdminControllers/Admin/movieTheaterController');
const TimeController = require('../../Controllers/AdminControllers/Admin/timeController');
const CityController = require('../../Controllers/AdminControllers/Admin/cityController');

adminRouter.get("/dashboard", adminController.dashBoard);
adminRouter.get("/update-profile", adminController.update_profile);

adminRouter.get("/profile", adminController.Profile);
adminRouter.get("/booking", adminController.Booking);
adminRouter.get("/bookings/:bookingId", adminController.oneBooking);
//
adminRouter.get("/Admin", adminController.Admin);
adminRouter.post('/store-Admin', adminController.storeAdmin);
adminRouter.get('/Admin/:id', adminController.oneAdmin);
adminRouter.get('/User', adminController.User);
adminRouter.get('/allusers', adminController.allUsers);
adminRouter.get('/User/:id', adminController.oneUser);
adminRouter.post('/updateuser/:id', adminController.updateUser)
adminRouter.get('/ServiceProvider', adminController.service_provider);
adminRouter.post('/update-service-provider/:id', adminController.updateServiceProvider);
adminRouter.get('/ServiceProvider/:id', adminController.oneServiceProvider);
adminRouter.get('/executive',executiveController.executive);
adminRouter.post('/add-executive', executiveController.addExecutive);
adminRouter.post('/update-executive/:id', executiveController.updateExecutive);
adminRouter.get('/delete-executive/:id', executiveController.deleteExecutive);

adminRouter.get('/movieTheater', movieTheaterController.movie_theater);
adminRouter.post('/addtheater', movieTheaterController.addMovieTheater);
adminRouter.get('/singletheater/:id', movieTheaterController.singleMovieTheater);
// adminRouter.post('/storeMovie', movieTheaterController.storeMovieTheater);
// adminRouter.post('/update-movie/:id', movieTheaterController.updateMovieTheater);
// adminRouter.get('/delete-movie/:id', movieTheaterController.deleteMovieTheater);
adminRouter.post("/update-admin/:id", adminController.updateAdmin);
adminRouter.get("/delete-admin/:id", adminController.deleteAdmin);
adminRouter.post("/updateprofile/:id", adminController.update_profile);

// adminRouter.get('/update-user/:id', adminController.updateUser);
// adminRouter.get('/update-provider/:id', adminController.updateServiceProvider);
// adminRouter.get('/update-movie/:id', adminController.updateMovieTheater);

// adminRouter.get('/delete-user/:id', adminController.deleteUser);
// adminRouter.get('/delete-provider/:id', adminController.deleteServiceProvider);
// adminRouter.get('/delete-movie/:id', adminController.deleteMovieTheater);

// adminRouter.get("/user", adminController.user);
// adminRouter.get("/Users", adminController.Users);
// adminRouter.get("/serviceProvider", adminController.serviceProvider);
// adminRouter.get("/ServiceProviders", adminController.ServiceProviders);
// adminRouter.get("/MovieTheater", adminController.MovieTheater);
// adminRouter.get("/movieTheater", adminController.movieTheater);


// adminRouter.get("/deleteuser/:id", adminController.deleteUser);

adminRouter.get("/banner", BannerController.allBanners);
adminRouter.post("/add-banner", BannerController.uploadImageToS3);
adminRouter.get("/get-banner-image", BannerController.getImageFromS3);
adminRouter.post("/update-banner/:id", BannerController.updateBanner);
adminRouter.get("/delete-banner/:id", BannerController.deleteBanner);


//time
adminRouter.get('/time', TimeController.time);
adminRouter.post('/addtime', TimeController.addTime);
adminRouter.get('/delete-time/:id', TimeController.deleteTime);

//city
adminRouter.get('/city', CityController.allCities);
adminRouter.post('/addCity', CityController.addCity);
adminRouter.post('/updateCity/:id', CityController.updateCity);




//countries
adminRouter.get('/country',CountryController.allCountries);
adminRouter.get('/view-country/:countryId', CountryController.oneCountry);
// adminRouter.get('/country/:status',CountryController.by_status);
adminRouter.post('/store-country',CountryController.addCountry);
adminRouter.post('/update-country/:id',CountryController.update);
adminRouter.get('/delete-country/:id',CountryController.delete);
  

//category
adminRouter.get('/category', CategoryController.allCatagories);
// adminRouter.get('/category',CategoryController.by_status);
adminRouter.post('/store-category',CategoryController.addCategory);
adminRouter.post('/update-category/:id',CategoryController.updateCategory);
adminRouter.get('/delete-category/:id',CategoryController.deleteCategory);
adminRouter.get('/category/:id',CategoryController.oneCategory);

//service
adminRouter.get('/service',ServiceController.allServices);
// adminRouter.get('/service/:status',ServiceController.by_status);
adminRouter.post('/store-service/:id',ServiceController.addService);
adminRouter.post('/update-service/:id',ServiceController.update);
adminRouter.post('/delete-service/:id',ServiceController.delete);

adminRouter.get('/subscription',SubscriptionController.allSubscription);
// adminRouter.get('/service/:status',ServiceController.by_status);
adminRouter.post('/store-subscription',SubscriptionController.addSubscription);
adminRouter.get('/subscriptions/:subscriptionId', SubscriptionController.oneSubscription)
adminRouter.post('/update-subscription/:id',SubscriptionController.update);
adminRouter.get('/delete-subscription/:id',SubscriptionController.delete);


// adminRouter.get("/settings", settingsController.settings);
// adminRouter.post("/addsettings", settingsController.addSettings);
// adminRouter.post("/addsetting/:id", settingsController.updateSettings);

adminRouter.get("/settings", settingsController.settings);
adminRouter.post("/updatesettings", settingsController.addSettings);
adminRouter.post("/updatesettings/:id", settingsController.Update_settings);

//notification
adminRouter.get("/notifications", NotificationController.allNotifications);
adminRouter.post('/add-notification', NotificationController.addNotification);



module.exports = adminRouter;