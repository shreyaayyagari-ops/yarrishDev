const Category = require('../../Models/categoriesModel');
const Service = require('../../Models/Service');
const User = require('../../Models/userModel');
const SelectedCategory = require('../../Models/selectedCategory');
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')


module.exports = {
	getServices: async (req, res) => {
		try {
			const services = await Category.find().select(['name', 'status', 'icon']).sort({ createdAt: -1 });

			return res.status(200).json({ services });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},

	getServicesbyId: async (req, res) => {
		try {
			const { id } = req.params;


			const service = await Category.findById(id).select('_id category');

			if (!service) {
				return res.status(404).json({ message: 'service not found' });
			}


			const services = await Service.find({ categoryId: id }).select('_id name description');

			return res.status(200).json({
				message: 'Category and services retrieved successfully',
				category: {
					_id: service._id,
					service: service.service
				},
				services: services
			});

		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	},

	Select_Services: async (req, res) => {
		try {
			let categoryIds = req.body.categoryIds;
			if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
				return res.status(400).json({ message: "Invalid or missing categoryIds" });
			}
			const userId = req.userId;
			const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
			if (!categoryIds.every(isValidObjectId)) {
				return res.status(400).json({ message: "One or more categoryIds are invalid" });
			}
			categoryIds = categoryIds.map(id => new mongoose.Types.ObjectId(id));

			const categories = await Category.find({ _id: { $in: categoryIds } }).select('name icon status');
			if (!categories.length) {
				return res.status(404).json({ message: "No services found for the given categoryIds" });
			}
			// const selectedCategory = new SelectedCategory({
			// 	userId: userId,
			// 	categoryIds: categoryIds,
			// 	categories: categories.map(category => ({
			// 		name: category.name,
			// 		icon: category.icon
			// 	}))
			// });
			//   console.log(selectedCategory.categories); 
			// await selectedCategory.save();
			const updatedUser = await User.findById(userId);
			if (!updatedUser) {
				return res.status(404).json({ message: "User not found" });
			}
			updatedUser.categories.push

			let adhar_card = false;
			let driving_license = false;
			let passport = false;

			const verify_user = await User.findById(userId).populate('country_id');
			const code = verify_user.country_id.code;
			for (const category of categories) {
				const categoryData = await Category.findById(category._id);
				if (categoryData && categoryData.drivingLicense === true) {
					driving_license = true;
					updatedUser.driving_license_status = true;
					break;
				}
			}
			if (!driving_license) {
				if (code === '+91') {
					adhar_card = true;
					updatedUser.aadhar_status = true;
				} else {
					passport = true;
					updatedUser.passport_status = true;
				}
			}
			updatedUser.adhar_card = adhar_card;
			updatedUser.driving_license = driving_license;
			updatedUser.passport = passport;
			updatedUser.screen_status = "location";
			const existingCategories = updatedUser.categories.map(cat => cat.toString());
			const newCategories = categoryIds.filter(id => !existingCategories.includes(id.toString()));
			updatedUser.categories.push(...newCategories);
			await updatedUser.save();
			return res.status(200).json({
				message: "Services updated successfully",
				// user: updatedUser,
				// services: categories,
				screen_status: updatedUser.screen_status,
				adhar_card,
				driving_license,
				passport
			});
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: 'Internal Server Error' });
		}
	}






};