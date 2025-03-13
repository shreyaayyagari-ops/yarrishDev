const { mongoose, Schema, model } = require('mongoose')


const SettingsSchema = new mongoose.Schema({
    userPrivacyPolicy: { type: String, required: false },
    userRefundPolicy: { type: String, required: false },
    userTermsAndConditions: { type: String, required: false },
    userAboutUs: { type: String, required: false },
    serviceProviderPrivacyPolicy: { type: String, required: false },
    serviceProviderRefundPolicy: { type: String, required: false },
    serviceProviderTermsAndConditions: { type: String, required: false },
    serviceProviderAboutUs: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    initialAmount: { type: Number, required: false },
    referralCode: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    referalAmount: { type: Number, required: false }

}, {
    timestamps: true,
});

SettingsSchema.methods.getPrivacyPolicy = function () {
    return {
        userPrivacyPolicy: this.userPrivacyPolicy,
        serviceProviderPrivacyPolicy: this.serviceProviderPrivacyPolicy
    };
};

SettingsSchema.methods.getRefundPolicy = function () {
    return {
        userRefundPolicy: this.userRefundPolicy,
        serviceProviderRefundPolicy: this.serviceProviderRefundPolicy
    };
};

SettingsSchema.methods.getTermsAndConditions = function () {
    return {
        userTermsAndConditions: this.userTermsAndConditions,
        serviceProviderTermsAndConditions: this.serviceProviderTermsAndConditions
    };
};

SettingsSchema.methods.getAboutUs = function () {
    return {
        userAboutUs: this.userAboutUs,
        serviceProviderAboutUs: this.serviceProviderAboutUs
    };
};

const Settings = mongoose.model('Settings', SettingsSchema);

module.exports = Settings;