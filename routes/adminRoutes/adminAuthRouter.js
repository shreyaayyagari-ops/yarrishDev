const   adminAuthRouter = require("express").Router();

const adminAuthController = require("../../Controllers/AdminControllers/adminAuthController");

adminAuthRouter.get("/login", adminAuthController.index);
adminAuthRouter.post("/loginpost",adminAuthController.login);
adminAuthRouter.get("/logout", adminAuthController.logout);
adminAuthRouter.get('/forgotpassword', adminAuthController.forgotPassword)
adminAuthRouter.post('/sendotp', adminAuthController.sendOtp)
adminAuthRouter.get("/otp", adminAuthController.otpGet); 
adminAuthRouter.post('/verifyotp', adminAuthController.verifyOtp);
adminAuthRouter.get('/updatePassword', adminAuthController.updatePasswordGet)
adminAuthRouter.post('/updatepassword', adminAuthController.updatePasswordPost)

adminAuthRouter.get("/privacypolicy", adminAuthController.ServiceProviderPrivacyPolicy);
adminAuthRouter.get("/userprivacypolicy", adminAuthController.userPrivacyPolicy);
// adminAuthRouter.get("/deleteaccountpolicy", adminAuthController.deleteAccountPolicy);

module.exports = adminAuthRouter;