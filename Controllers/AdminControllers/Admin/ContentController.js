const settings = require('../../../Models/settings');


module.exports = {
    settings: async (req, res) => {
        try {
            const allSettings = await settings.findOne()
            .populate({
                path: 'referralCode',
                select: 'referralCode',
            });
            return res.render("settings", {
                allSettings,
                success: req.flash("success"),
                error: req.flash("error")
            })
        } catch (error) {
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    },
    addSettings: async (req, res) => {
        try {
            const {userPrivacyPolicy,
                userRefundPolicy,
                userTermsAndConditions,
                userAboutUs,
                serviceProviderPrivacyPolicy,
                serviceProviderRefundPolicy,
                serviceProviderTermsAndConditions,
                serviceProviderAboutUs,
                email,
                phone,
                initialAmount,
                referalAmount
            } = req.body;
            const newSettings = new settings({
                userPrivacyPolicy,
                userRefundPolicy,
                userTermsAndConditions,
                userAboutUs,
                serviceProviderPrivacyPolicy,
                serviceProviderRefundPolicy,
                serviceProviderTermsAndConditions,
                serviceProviderAboutUs,
                email,
                phone,
                initialAmount,
                referalAmount
            });
            await newSettings.save();
            req.flash("success", "settings added successfully");
            return res.redirect("/admin/settings");
        } catch (error) {
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    },
    Update_settings: async (req, res) => {
        try {
            const settingsId = req.params.id;
            const {
                userPrivacyPolicy,
                userRefundPolicy,
                userTermsAndConditions,
                userAboutUs,
                serviceProviderPrivacyPolicy,
                serviceProviderRefundPolicy,
                serviceProviderTermsAndConditions,
                serviceProviderAboutUs,
                email,
                phone,
                initialAmount,
                referalAmount
            } = req.body;
            if (!settingsId) {
                req.flash("error", "Invalid settings Id");
                return res.redirect("/admin/settings");
            }
            const allSettings = await settings.findById(settingsId);
            if (!allSettings) {
                req.flash("error", "Invalid settings Id");
                return res.redirect("/admin/settings");
            }
            allSettings.userPrivacyPolicy = userPrivacyPolicy;
            allSettings.userRefundPolicy = userRefundPolicy;
            allSettings.userTermsAndConditions = userTermsAndConditions;
            allSettings.userAboutUs = userAboutUs;
            allSettings.serviceProviderPrivacyPolicy = serviceProviderPrivacyPolicy;
            allSettings.serviceProviderRefundPolicy = serviceProviderRefundPolicy;
            allSettings.serviceProviderTermsAndConditions = serviceProviderTermsAndConditions;
            allSettings.serviceProviderAboutUs = serviceProviderAboutUs;
            allSettings.email = email;
            allSettings.phone = phone;
            allSettings.initialAmount = initialAmount;
            allSettings.referalAmount = referalAmount;
            await allSettings.save()
            req.flash("success", "settings updated successfully");
            return res.redirect("/admin/settings");
        } catch (error) {
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    }

};
