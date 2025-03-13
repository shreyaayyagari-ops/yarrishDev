// const Setting = require("../../Models/Se");
const Country = require("../../Models/Country.js");
const { body, validationResult } = require('express-validator');
const { uploadFile, deleteFile } = require("../../middleware/awsMiddleware.js");
const AWS = require('aws-sdk');
const User = require('../../Models/userModel.js');
const { UniqueString } = require('unique-string-generator');

// Configure AWS S3 once
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const s3 = new AWS.S3();

const isValidCategoryName = (name) => {
    const regex = /^[A-Za-z]{3,30}$/;
    return regex.test(name);
};

module.exports = {
    allCountries: async (req, res) => {
        const allCountries = await Country.find().sort({ name: 1, createdAt: -1 });
        //console.log("All countries:", allCountries);
        return res.render('allCountries', {
            allCountries: allCountries,
            success: req.flash("success"),
            error: req.flash("error"),
        });
    },

    oneCountry: async (req, res) => {
        try {
            const countryId = req.params.countryId;
    
            // Find the country
            const country = await Country.findById(countryId);
    
            if (!country) {
                req.flash("error", "Country not found");
                return res.redirect('/admin/country');
            }
    
            // Find users related to the country
            const users = await User.find({ country_id: countryId }).select('name email phone');
    
            // // If no users are found
            // if (!users || users.length === 0) {
            //     req.flash("error", "No users found for this country");
            //     return res.redirect('/admin/country');
            // }
    
            // Render the page with country and users data
            return res.render("viewCountry", {
                countrys: country,
                Users: users,
                success: req.flash("success"),
                error: req.flash("error")
            });
        } catch (error) {
            console.error(error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    }
    ,



    addCountry: async (req, res) => {
        try {
            await body('name')
                .notEmpty().withMessage('Country name is required')
                .isLength({ min: 2 }).withMessage('Country name must be at least 2 characters long')
                .run(req);

            // await body('code')
            //     .notEmpty().withMessage('Country code is required')
            //     .isLength({ min: 2, max: 3 }).withMessage('Country code must be 2-3 characters long')
            //     // .matches(/^[A-Za-z]+$/).withMessage('Country code must contain only alphabetic characters')
            //     .run(req);


            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                req.flash("error", errors.array().map(err => err.msg).join(', '));
                return res.redirect('/admin/country');
            }

            const { name, code } = req.body;

            const existingCountry = await Country.findOne({ $or: [{ name }, { code }] });
            if (existingCountry) {
                req.flash("error", "Country with the same name or code already exists.");
                return res.redirect('/admin/country');
            }

            const countryPicture = req.files ? req.files.countryPicture : null;
            // console.log(req.files)
            if (!countryPicture) {
                req.flash("error", "pic is required");
                return res.redirect('/admin/country');
            }
            const picturePicturePath = await uploadFile(countryPicture, "yaarish", "country");
            if (!picturePicturePath) {
                req.flash("error", "Invalid picture while uploading");
                return res.redirect("/admin/country");
            }

            await Country.create({ name: name, code, icon: picturePicturePath, status: 'Active' });
            req.flash("success", "country added successfully");
            return res.redirect("/admin/country");

        } catch (error) {
            console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    },

    getcountries: async (req, res) => {
        try {
            const countries = await Country.find();
            return res.status(200).json({ countries });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },





    update: async (req, res) => {
        try {
            const countryId = req.params.id;
            const { name, code, status } = req.body;
            const countryPicture = req.files ? req.files.countryPicture : null;

            if (!countryId) {
                req.flash("error", "Invalid country Id");
                return res.redirect("/admin/country");
            }

            const country = await Country.findById(countryId);
            if (!country) {
                req.flash("error", "Country not found");
                return res.redirect('/admin/country');
            }

            const existingCountry = await Country.findOne({ 
                $and: [
                    { $or: [{ name }, { code }] },
                    { _id: { $ne: countryId } }
                ] 
            });
    
            if (existingCountry) {
                req.flash("error", "Country with the same name or code already exists.");
                return res.redirect('/admin/country');
            }

            country.name = name || country.name;
            country.code = code || country.code;
            country.status = status || country.status;


            if (countryPicture) {
                await deleteFile(country.icon, "yaarish", "country");
                const picturePicturePath = await uploadFile(countryPicture, "yaarish", "country");
                country.icon = picturePicturePath;
            }

            await country.save();

            req.flash("success", "Country updated successfully");
            return res.redirect('/admin/country');
        } catch (error) {
            console.log("Error in updateCountry:", error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/country");
        }
    },


    delete: async (req, res) => {
        try {
            const countryId = req.params.id;


            if (!countryId) {
                req.flash("error", "Invalid country ID");
                return res.redirect("/admin/country");
            }

            const country = await Country.findById(countryId);

            if (!country) {
                req.flash("error", "Country not found");
                return res.redirect("/admin/country");
            }


            if (country.icon) {
                const deleteParams = {
                    Bucket: "yaarish",
                    Key: country.icon.split('/').pop()
                };
                await s3.deleteObject(deleteParams).promise();
            }

            await Country.findByIdAndDelete(countryId);



            req.flash("success", "Country successfully deleted");
            return res.redirect("/admin/country");

        } catch (error) {
            //console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/country");
        }
    }

};