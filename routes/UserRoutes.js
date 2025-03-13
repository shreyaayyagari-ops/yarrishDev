const express = require("express");
const router = express.Router();

const UserControllers = require('../Controllers/user/UserController');
const BookingController = require('../Controllers/user/bookingController');
const TimeController = require('../Controllers/user/timeController');
const AddressController = require('../Controllers/user/addressController');
const WishlistController = require('../Controllers/user/WishlistController');
const SubServiceController = require('../Controllers/user/subServiceController');
const ServiceController = require('../Controllers/user/serviceController');
const { auth, serviceProviderAuthorization } = require('../middleware/authMiddlewares');
const SubscriptionController = require('../Controllers/user/subscriptioncontroller');
const CurrencyController = require('../Controllers/user/currencyController');
const BannerController = require('../Controllers/user/bannerController');
// const RefferalController = require('../Controllers/user/referalControllers');
// const { verifyServiceProviderDocs, allowProfileSwitch } = require('../middleware/ProfileMiddleware');
const NotificationController = require("../Controllers/user/NotificationsController");
const ProofVerificationController = require("../Controllers/user/ProofVerificationController");
const PassportVerificationController = require('../Controllers/passportController');

router.post("/register", UserControllers.register);
router.post('/addCountry', UserControllers.addCountry);
router.get('/get-country', UserControllers.get_country);
router.post('/login', UserControllers.login);

router.get('/verification-status', auth, UserControllers.getVerificationStatus);
router.post('/verify-Aadhaar', serviceProviderAuthorization, ProofVerificationController.aadhaarVerifyingOTP);
router.post('/aadhar-otp', serviceProviderAuthorization, ProofVerificationController.aadhaarSendingOTP);
router.post('/verify-driving-license', serviceProviderAuthorization, ProofVerificationController.verifyDrivingLicense);
router.post('/verify-passport', serviceProviderAuthorization, PassportVerificationController.verifyPassport);

router.post('/verify-login', UserControllers.verify_login_otp);
// router.post('/create-password', UserControllers.create_password);
// router.post('/forget-password', UserControllers.forget_password);
// router.post('/reset-password', UserControllers.reset_password);
router.patch('/toggle-role',auth, UserControllers.Profiletoggle);
router.post('/logout', UserControllers.logout);

router.put('/verify-otp', auth, UserControllers.verify_otp);
router.get('/walletBalance', auth, UserControllers.getWalletBalance);
router.post('/resend-otp', UserControllers.resend_otp);
router.get('/profile', auth, UserControllers.profile);
router.patch('/update-profile', auth, UserControllers.update_profile)
router.post('/proof-varification', auth, UserControllers.proof_verification);

// //switch profile
// router.post("/switch-profile", auth, allowProfileSwitch, UserControllers.switchProfile);
// router.get("/dashboard", auth, UserControllers.getUserDashboard);
// router.get("/service-provider/dashboard", auth, verifyServiceProviderDocs, UserControllers.getServiceProviderDashboard);

//Sub-service
router.get('/get-allSubservices/:categoryId', auth, SubServiceController.get_Subservices);
router.get('/get-Subservices/:categoryId', auth, SubServiceController.getSubservicesById);
router.get('/my-Subservices', auth, SubServiceController.my_Subservices);
router.post('/get-providers', SubServiceController.getServiceProviders);

//services
router.get('/get-Services', auth, ServiceController.getServices);
router.get('/get-Services/:id', ServiceController.getServicesbyId);
router.post('/select-Services', auth, ServiceController.Select_Services);

//booking
router.post('/book-service', auth, BookingController.createBooking);
router.post('/checkout-booking', auth, BookingController.checkoutBooking);
router.post('/payment/initiate', auth, BookingController.initiatePayment);
router.post('/payment/success/booking', BookingController.handlePaymentSuccess);
// router.post('/payment/failure', BookingController.handlePaymentFailure);

// router.get('/get-service-booking', auth, BookingController.getBookings);
// router.get('/get-booking/:bookingId', auth, BookingController.getBookingById);

// router.get('/get-serviceProvider-Bookings/:bookingId',auth, BookingController.getBookingofServiceProviderById);
router.patch('/bookings-cancel/:bookingId', auth, BookingController.cancelBooking);
router.get('/getCanceled-bookings', serviceProviderAuthorization, BookingController.getdeclinedBookings);
router.post('/complete-booking/:bookingId/', serviceProviderAuthorization, BookingController.completeBooking);
router.get('/get-completed-bookings', serviceProviderAuthorization, BookingController.getAllCompletedBookings);
router.get('/get-History', auth, BookingController.getBookingHistory);    //history
router.get('/today-booking', serviceProviderAuthorization, BookingController.getTodaysBookings);  // todays booking
router.get('/upcoming-bookings', auth, BookingController.getUpcomingBookings);  //upcoming bookings
router.patch('/accept-booking/:bookingId', serviceProviderAuthorization, BookingController.acceptBooking); // accept booking
router.get('/get-accepted-bookings', auth, BookingController.getAcceptedBookings);
// router.get('/details/:bookingId', auth, BookingController.getServiceProviderDetails);
router.patch('/bookings/:bookingId/decline', serviceProviderAuthorization, BookingController.declineBooking); // decline booking
// router.get('/service-provider/bookings', auth, BookingController.getServiceProviderBookings); // get bookings from service provider side
router.get('/getbooking-count', serviceProviderAuthorization, BookingController.getBookingCounts);
router.get('/getUpcoming', serviceProviderAuthorization, BookingController.getUpcomingBookingsForServiceProvider);
router.get('/get-booking-details/:bookingId', serviceProviderAuthorization, BookingController.getBookingDetails);
router.get('/get-pending',serviceProviderAuthorization, BookingController.getPendingBookings); 

//Date&Time
router.post('/add-time', TimeController.createTimeEntry);
router.get('/time', TimeController.getTimeSlots);
router.get('/time/:id', TimeController.getTimeById);

// //serviceproviders
// router.post('/create-request', ServiceRequestController.createServiceRequest);
// router.put('/update-request',ServiceRequestController.updateRequestStatus);
// router.get('/service-providers', ApiController.getServiceProviders);

//address
router.post('/address', auth, AddressController.addAddress);
router.post('/select-location', auth, AddressController.select_location);
router.get('/get-location', auth, AddressController.get_all_locations);
router.get('/get-address/:addressId', auth, AddressController.getAddress);
router.get('/get-All-address', AddressController.getAllAddresses);
// router.patch('/update/:addressId',auth, AddressController.updateAddress)/;
router.delete('/delete/:addressId', auth, AddressController.deleteAddress);
router.get('/update-status/:addressId', auth, AddressController.defaultAddress);

//wishlist
router.post('/wishlist-add', auth, WishlistController.addServiceToWishlist);
router.post('/payment/failure', auth, WishlistController.handlePaymentFailure);
router.delete('/delete-wishlist/:wishlistId', auth, WishlistController.deleteWishList);
router.post('/checkout', auth, WishlistController.checkoutWishlist);
router.post('/payment/initiate/wishlist', auth, WishlistController.initiatePayment);
router.post('/payment/success/wishlist', WishlistController.handlePaymentSuccess);
router.post('/payment/failure',auth, WishlistController.handlePaymentFailure);
router.post('/wishlist-create',auth, WishlistController.addWishlist);
router.get('/wishlist', auth, WishlistController.getWishlist);

// router.post('/wishlist-payment' ,auth, WishlistController.makePayment);

//currency
router.post('/add-currency', CurrencyController.createCurrency);
router.get('/get-currency', CurrencyController.getCurrencies);
router.patch('/update-currency/:currencyId', CurrencyController.updateCurrency);

//banner
router.get('/get-banner', auth, BannerController.getBanners);

//subscription
router.get('/get-plans', auth, SubscriptionController.get_plans);
router.get('/get-subscription/:id', auth, SubscriptionController.getSubscriptionById);
router.get('/wallet', auth, SubscriptionController.viewWallet);

// payu
router.post('/payu/initiate', auth, SubscriptionController.initiatePayment);
router.post('/payu/success', auth, SubscriptionController.paymentSuccess);
// router.post('/payu/failure', auth, SubscriptionController.paymentfailure);

router.get('/settings', auth, UserControllers.getSettings);

//notification
router.get('/notifications', auth, NotificationController.getNotifications);
// //referral
// router.post("/use-referral", auth,RefferalController.useReferralCode);

module.exports = router;