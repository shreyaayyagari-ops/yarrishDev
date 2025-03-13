const express = require("express");
const router = express.Router();
const UserController = require('../../Controllers/user/UserController');
const passportController = require("../../Controllers/passportController");

router.get('/privacy-policy', UserController.getPrivacyPolicy);
router.get('/refund-policy', UserController.getRefundPolicy);
router.get('/terms-and-conditions', UserController.getTermsAndConditions);
router.get('/helpandsupport', UserController.HelpAndSupport);
router.get('/about-us', UserController.getAboutUs);
router.get('/deleteAccountPolicy', UserController.DeleteAccountPolicy);

router.post("/passport", passportController.verifyPassport);

module.exports = router;