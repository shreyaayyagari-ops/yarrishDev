const Service = require("../../../Models/Service.js");
const Category = require("../../../Models/categoriesModel.js");
const AWS = require('aws-sdk');
const { uploadFile, deleteFile } = require("../../../middleware/awsMiddleware.js");
const { UniqueString } = require('unique-string-generator');

AWS.config.update({
	accessKeyId: process.env.ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION
});
const s3 = new AWS.S3();

module.exports = {

	allServices: async (req, res) => {
		const services = await Service.find().populate('category').sort({ createdAt: -1 });
		const allCatagories = await Category.find();
		// //console.log(services);
		return res.render('Services', {
			allServices: services,
			allCatagories: allCatagories,
			success: req.flash("success"),
			error: req.flash("error"),
		});
	},

	// by_status : async (req, res) => {
	// 	const setting = await Setting.findOne().skip(0);
	// 	const services = await Service.find({status:req.params.status});
	// 	res.render('admin/service/index',{services,setting});
	// },



	addService: async (req, res) => {
		try {
			const categoryId = req.params.id;
			const { name } = req.body;
			const servicePicture = req.files ? req.files.servicePicture : null
			const categoryExists = await Category.findById(categoryId);
			if (!categoryExists) {
				req.flash("error", "Invalid category provided");
				return res.redirect(`/admin/category/${categoryId}`);
			}
			if (!servicePicture) {
				req.flash("error", "Pic is required");
				return res.redirect(`/admin/category/${categoryId}`);
			}

			const picturePicturePath = await uploadFile(servicePicture, "yaarish", "service");
			if (!picturePicturePath) {
				req.flash("error", "Invalid picture while uploading");
				return res.redirect(`/admin/category/${categoryId}`);
			}


			await Service.create({
				name: name,
				category: categoryId,
				// preference: preference || false,
				icon_path: picturePicturePath,
				status: 'Active'
			});

			req.flash("success", "Sub-Service added successfully");
			return res.redirect(`/admin/category/${categoryId}`);
		} catch (error) {
			console.log(error);
			req.flash("error", "Internal server error");
			return res.redirect("/admin/dashboard");
		}
	},

	getServices: async (req, res) => {
		try {
			const services = await Service.find();
			return res.status(200).json({ services });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	update: async (req, res) => {
		try {
			const serviceId = req.params.id;
			const { name, category, status } = req.body;
			const servicePicture = req.files ? req.files.servicePicture : null;
			console.log(servicePicture)

			const categoryExists = await Category.findById(category);
			if (!categoryExists) {
				req.flash("error", "Invalid category provided");
				return res.redirect(`/admin/category/${category}`);
			}

			if (!serviceId) {
				req.flash('error', "Invalid service Id");
				return res.redirect(`/admin/category/${category}`);
			}

			const service = await Service.findById(serviceId);
			if (!service) {
				req.flash('error', "Service not found");
				return res.redirect(`/admin/category/${category}`);
			}

			if (name) {
				service.name = name;
			}

			if (status) {
				service.status = status;
			} else {
				service.status = service.status || 'Active';
			}

			if (servicePicture) {
				await deleteFile(service.icon_path, "yaarish", "service");
				const picturePicturePath = await uploadFile(servicePicture, "yaarish", "category");
				service.icon_path = picturePicturePath;
			}

			await service.save();

			req.flash('success', "Service updated successfully");
			return res.redirect(`/admin/category/${category}`);

		} catch (error) {
			console.log("Error in update service:", error);
			req.flash("error", "Internal server error");
			return res.redirect(`/admin/dashboard`);
		}
	},


	delete: async (req, res) => {
		try {
			const serviceId = req.params.id;
			const categoryId = req.body.categoryId;
			if (!serviceId || !categoryId) {
				req.flash("error", "Invalid Service ID or Category ID");
				return res.redirect(`/admin/category`);
			}

			const service = await Service.findById(serviceId);

			if (!service) {
				req.flash("error", "Service details not found");
				return res.redirect(`/admin/category/${categoryId}`);
			}

			if (service.icon) {
				const deleteParams = {
					Bucket: "yaarish",
					Key: service.icon.split('/').pop()
				};

				await s3.deleteObject(deleteParams).promise();
			}

			await Service.findByIdAndDelete(serviceId);

			req.flash("success", "service successfully deleted");
			return res.redirect(`/admin/category/${categoryId}`);

		} catch (error) {
			//console.log(error);
			req.flash("error", "Internal server error");
			return res.redirect(`/admin/dashboard`);
		}
	}



}