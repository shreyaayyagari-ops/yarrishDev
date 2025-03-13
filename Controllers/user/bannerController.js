const banner = require('../../Models/bannersModel');

module.exports = {
    getBanners: async (req, res) => {
        try {
            const allBanners = await banner.find({status: 'Active'}).sort({ createdAt: -1 }); 
            return res.status(200).json({
                success: true,
                message: 'Banners retrieved successfully.',
                data: allBanners
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

};