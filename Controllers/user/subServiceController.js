const Service = require('../../Models/Service');
const User = require('../../Models/userModel');
const Category = require('../../Models/categoriesModel');
const mongoose = require('mongoose');


module.exports = {
    getServiceProviders: async (req, res) => {
		try {

			const serviceProviders = await User.find({ role: 'service_provider' })



			const providersWithUserDetails = serviceProviders.map(provider => ({
				_id: provider._id,
				name: provider.name,
				contact: provider.phone,
				icon_path: provider.icon_path,
				status: provider.status,

			}));

			return	res.status(200).json({
				message: 'Service providers fetched successfully',
				serviceProviders: providersWithUserDetails,
			});
		} catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
	},

    getServiceProviders: async (req, res) => {
		try {
			const users = await User.find({ role: 'service_provider' });
			const hasServiceProviders = users.length > 0;

			return	res.json({
				hasServiceProviders,
				count: users.length,
				users
			});
		} catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
	},

    get_Subservices: async (req, res) => {
		try {
			const { categoryId } = req.params;			
			if (!mongoose.Types.ObjectId.isValid(categoryId)) {
				return res.status(400).json({ message: "Invalid categoryId" });
			}
			const services = await Service.find({ category: categoryId })
				.select('_id name icon_path preference') 
				.populate('category', 'name icon status'); 
			if (services.length === 0) {
				return res.status(404).json({ message: "No services found for the given category" });
			}
			const response = services.map(service => ({
				service_id: service._id,
				service_name: service.name,
				service_icon: service.icon_path,
				preference: service.preference,
				// full_icon_path: service.full_icon_path 
			}));
			return res.status(200).json({services : response});
		} catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
	},


	getSubservicesById: async (req, res) => {
		try {
			const { categoryId } = req.params;
			const subServices = await Service.find({ category: categoryId }).select(['_id', 'name', 'icon_path']);

			if (!subServices || subServices.length === 0) {
				return res.status(404).json({ message: 'No subServices found for this category' });
			}

			const processedServices = subServices.map(service => ({
				_id: subServices._id,
				name: subServices.name,
				icon: subServices.icon_path
			}));

			return res.status(200).json({services: processedServices} );
		} catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
	},


	

	my_Subservices: async (req, res) => {
		try {
			const user = await User.findOne({ _id: req.user.id }).populate('services');
			
			
			if (!user) {
				return res.status(404).json({ success: false, message: 'User not found' });
			}
	
			return res.status(200).json({
				success: true,
				message: 'Sub-Services retrieved successfully',
				services: user.services
			});
	
		} catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
	}

}