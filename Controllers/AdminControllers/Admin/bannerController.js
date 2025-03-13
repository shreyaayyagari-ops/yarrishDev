const mongoose = require('mongoose');
const banners = require('../../../Models/bannersModel');
const AWS = require('aws-sdk');
const { UniqueString } = require('unique-string-generator');


AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const s3 = new AWS.S3();


module.exports = {

    allBanners: async (req, res) => {
        try {
            const allBanners = await banners.find().sort({ createdAt: -1 });
            return res.render('allBanners', {
                allBanners: allBanners,
                success: req.flash('success'),
                error: req.flash('error')
            })
        } catch (error) {
            req.flash('error', 'Internal server error');
            return res.redirect('/admin/dashboard')
        }
    },

    getImageFromS3: async (req, res) => {
        const key = req.query.key;
        const params = {
            Bucket: "yaarish",
            Key: key,
        };

        try {
            const data = await s3.getObject(params).promise();
            return res.setHeader("Content-Type", data.ContentType);
            return res.send(data.Body);
        } catch (error) {
            console.error("Error downloading image from S3:", error);
            return res.status(500).send("Error downloading image from S3");
        }
    },


    uploadImageToS3: async (req, res) => {
        console.log(req.body)
        try {
            const bannerFile = req.files?.bannerPicture;
            if (!bannerFile) {
                req.flash('error', 'No banner file provided.');
                return res.redirect('/admin/banner');
            }
            [[]]
            const originalExtension = bannerFile.name.split('.').pop().toLowerCase();
            // const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

            // if (!allowedExtensions.includes(originalExtension)) {
            //     req.flash('error', 'Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.');
            //     return res.redirect('/admin/banner');
            // }

            const timestamp = Date.now();
            const safeFileName = bannerFile.name.replace(/[^a-zA-Z0-9]/g, '_');
            const fileExtension = originalExtension;
            const filename = `banners/${timestamp}_${safeFileName}.${fileExtension}`;

            const uploadParams = {
                Bucket: "yaarish",
                Key: filename,
                Body: bannerFile.data,
                ContentType: bannerFile.mimetype,
            };

            const s3Response = await s3.upload(uploadParams).promise();
            //console.log("S3 Upload Response:", s3Response);

            const banner = await banners.create({ bannerPicture: s3Response.Location });
            if (!banner) {
                req.flash('error', "Error while creating a banner.");
                return res.redirect('/admin/banner');
            }

            req.flash('success', "Banner added successfully.");
            return res.redirect('/admin/banner');

        } catch (error) {
            console.error("Error in uploadImageToS3:", error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/banner");
        }
    },




    // addBanners: async (req, res) => {
    //     try {
    //         const bannerFile = req.files?.bannerPicture;
    //         //console.log(bannerFile);

    //         if (!bannerFile) {
    //             req.flash('error', 'No banner file provided.');
    //             return res.redirect('/admin/banner');
    //         }

    //         const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    //         const originalExtension = bannerFile.name.split('.').pop().toLowerCase();

    //         if (!allowedExtensions.includes(originalExtension)) {
    //             req.flash('error', 'Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.');
    //             return res.redirect('/admin/banner');
    //         }

    //         // Use a meaningful file name based on original name, with a timestamp for uniqueness
    //         const timestamp = Date.now();
    //         const safeFileName = bannerFile.name.replace(/[^a-zA-Z0-9]/g, '_'); // Remove special characters
    //         const filename = `${timestamp}_${safeFileName}`;

    //         const fileContent = bannerFile.data;

    //         const params = {
    //             Bucket: "yaarish",
    //             Key: filename,
    //             Body: fileContent,
    //             ContentType: bannerFile.mimetype,
    //         };

    //         //console.log("Attempting to upload:", params);

    //         // Upload to S3
    //         const s3Response = await s3.upload(params).promise();
    //         //console.log("S3 Upload Response:", s3Response);

    //         // Save the S3 file URL in the database
    //         const banner = await banners.create({ bannerPicture: s3Response.Location });
    //         if (!banner) {
    //             req.flash('error', "Error while creating a banner.");
    //             return res.redirect('/admin/banner');
    //         }

    //         req.flash('success', "Banner created successfully.");
    //         return res.redirect('/admin/banner');

    //     } catch (error) {
    //         console.error("Error in addBanners:", error);
    //         req.flash("error", "Internal server error");
    //         return res.redirect("/admin/banner");
    //     }
    // },



    updateBanner: async (req, res) => {
        try {
            const { id: bannerId } = req.params;
            const bannerPicture = req.files?.bannerPicture;
            const status = req.body.status;

            let updateData = { status };

            if (bannerPicture) {
                const timestamp = Date.now();
                const safeFileName = bannerPicture.name.replace(/[^a-zA-Z0-9]/g, '_');
                const filename = `banners/${timestamp}_${safeFileName}`;
                const uploadParams = {
                    Bucket: "yaarish",
                    Key: filename,
                    Body: bannerPicture.data,
                    ContentType: bannerPicture.mimetype,
                };

                const s3Response = await s3.upload(uploadParams).promise();
                updateData.bannerPicture = s3Response.Location;
            }

            const updatedBanner = await banners.findByIdAndUpdate(bannerId, updateData, { new: true });

            if (!updatedBanner) {
                req.flash('error', 'Banner not found');
                return res.redirect('/admin/banner');
            }

            req.flash('success', 'Banner updated successfully');
            return res.redirect('/admin/banner');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Server Error');
            return res.redirect('/admin/banner');
        }
    },

    deleteBanner: async (req, res) => {
        try {
            const bannerId = req.params.id;

            if (!bannerId) {
                req.flash("error", "Invalid banner ID");
                return res.redirect("/admin/banner");
            }

            const deletebanner = await banners.findById(bannerId);

            if (!deletebanner) {
                req.flash("error", "banner not found");
                return res.redirect("/admin/banner");
            }
            if (deletebanner.icon) {
                const deleteParams = {
                    Bucket: "yaarish",
                    Key: deletebanner.icon
                };
                await s3.deleteObject(deleteParams).promise();
            }

            await banners.findByIdAndDelete(bannerId);

            req.flash("success", "banner successfully deleted");
            return res.redirect("/admin/banner");
        } catch (error) {
            console.error("Error in delete:", error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/banner");
        }
    }





};