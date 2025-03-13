const Category = require("../../../Models/categoriesModel.js");
const SubCategory = require("../../../Models/Service.js");
const { uploadFile, deleteFile } = require("../../../middleware/awsMiddleware.js");
const image = require('../../../Models/image.js');
const AWS = require('aws-sdk');
const { UniqueString } = require('unique-string-generator');

AWS.config.update({
	accessKeyId: process.env.ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION
});
const s3 = new AWS.S3();


const isValidCategoryName = (name) => {
	const regex = /^[A-Za-z]{3,30}$/;
	return regex.test(name);
};


module.exports = {

	allCatagories: async (req, res) => {
		const categories = await Category.find().sort({ createdAt: -1 });
		// console.log(categories)
		return res.render('Categories', {
			allCategories: categories,
			success: req.flash("success"),
			error: req.flash("error"),
		});
	},




	addCategory: async (req, res) => {
		try {
			const { name, drivingLicense } = req.body;
			if (!name) {
				req.flash('error', "Service name is required.");
				return res.redirect('/admin/category');
			}
			const categoryPicture = req.files ? req.files.categoryPicture : null;
			if (!categoryPicture) {
				req.flash("error", "Pic is required");
				return res.redirect("/admin/category");
			}
			const picturePicturePath = await uploadFile(categoryPicture, "yaarish", "category");
			if (!picturePicturePath) {
				req.flash("error", "Invalid picture while uploading");
				return res.redirect("/admin/category");
			}
			if(drivingLicense == "on") {
				await Category.create({ name: name, icon: picturePicturePath, status: 'Active', drivingLicense: true });
			} else {
				await Category.create({ name: name, icon: picturePicturePath, status: 'Active', drivingLicense: false });
			}
			req.flash("success", "Service Added successfully");
			return res.redirect("/admin/category");
		} catch (error) {
			console.log(error);
			req.flash("error", "Internal server error");
			return res.redirect("/admin/dashboard");
		}
	},

	getCategories: async (req, res) => {
		try {
			const categories = await Category.find().sort({ createdAt:-1 });
			return res.status(200).json({ categories });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	updateCategory: async (req, res) => {
		try {
			// console.log(req.body)
			const categoryId = req.params.id;
			const { name, Status, drivingLicense } = req.body;
			const categoryIcon = req.files ? req.files.categoryPicture : null;
	
			if (!categoryId) {
				req.flash('error', "Invalid category Id");
				return res.redirect('/admin/category');
			}
	
			const category = await Category.findById(categoryId);
	
			if (!category) {
				req.flash('error', "Category not found");
				return res.redirect('/admin/category');
			}
	
			if (name) {
				category.name = name;
			}
	
			if (Status) {
				category.status = Status || category.status;
			}

			if (req.body.drivingLicense !== undefined) {
				category.drivingLicense = req.body.drivingLicense === "on";
			}
	
			if (categoryIcon) {
				await deleteFile(category.icon, "yaarish", "category");
				const picturePicturePath = await uploadFile(categoryIcon, "yaarish", "category");
				category.icon = picturePicturePath;
			}
	
			await category.save();
	
			req.flash('success', "Service updated successfully");
			return res.redirect('/admin/category');
		} catch (error) {
			console.log(error);
			req.flash("error", "Internal server error");
			return res.redirect("/admin/category");
		}
	}
	,

	deleteCategory: async (req, res) => {
		try {
			const categoryId = req.params.id;
	
			if (!categoryId) {
				req.flash("error", "Invalid service ID");
				return res.redirect("/admin/category");
			}
	
			const category = await Category.findById(categoryId);
	
			if (!category) {
				req.flash("error", "Service not found");
				return res.redirect("/admin/category");
			}
	
			if (category.icon) {
				const deleteParams = {
					Bucket: "yaarish",
					Key: category.icon.split('/').pop()
				};
				try {
					await s3.deleteObject(deleteParams).promise();
				} catch (s3Error) {
					console.error("Error deleting icon from S3:", s3Error);
					// You can choose to continue or handle the error differently
				}
			}
	
			const deleteResult = await Category.findByIdAndDelete(categoryId);
	
			if (!deleteResult) {
				req.flash("error", "Failed to delete category");
				return res.redirect("/admin/category");
			}
	
			req.flash("success", "Successfully deleted");
			return res.redirect("/admin/category");
		} catch (error) {
			console.error("Error in delete:", error);
			req.flash("error", "Internal server error");
			return res.redirect("/admin/category");
		}
	},


	oneCategory: async (req, res) => {
		try {
			const categoryId = req.params.id;

			if (!categoryId) {
				req.flash("error", "Invalid category ID");
				return res.redirect("/admin/category");
			}

			const category = await Category.findById(categoryId);
			const subcategories = await SubCategory.find({ category: categoryId }).sort({ createdAt:-1 });
			const allCategories = await Category.find().sort({ createdAt:-1 });

			if (!category) {
				req.flash("error", "Category not found");
				return res.redirect("/admin/category");
			}

			return res.render("onecategory", {
				category,
				subcategories,
				allCategories,
				success: req.flash("success"),
				error: req.flash("error")
			});
		} catch (error) {
			console.error("Error in oneCategory:", error);
			req.flash("error", "Internal server error");
			return res.redirect("/admin/category");
		}
	}
}; 