const City = require('../../../Models/beatTheBox/city');

module.exports = {

    allCities: async (req, res) => {
        try {
            const allCities = await City.find().sort({ createdAt: -1 });
            return res.render('allCities', {
                allCities: allCities,
                success: req.flash('success'),
                error: req.flash('error')
            })
        } catch (error) {
            req.flash('error', 'Internal server error');
            return res.redirect('/admin/dashboard')
        }
    }, 

    addCity: async (req, res) => {
        try {
            const { cityName } = req.body;
            if (!cityName || typeof cityName !== 'string' || cityName.trim() === '') {
                req.flash('error', 'Valid city name is required');
                return res.redirect('/admin/city'); 
            }
            const existingCity = await City.findOne({ cityName: cityName.trim() });
            if (existingCity) {
                req.flash('error', 'City name already exists');
                return res.redirect('/admin/city'); 
            }
            await City.create({ cityName: cityName.trim() });
            req.flash('success', 'City added successfully');
            return res.redirect('/admin/city');
        } catch (error) {
            console.error('Error adding city:', error.message);
            req.flash('error', 'Failed to create city. Please try again.');
            return res.redirect('/admin/dashboard'); 
        }
    },

    updateCity: async (req, res) => {
        try {
            const { cityName, status } = req.body;
            const { id } = req.params;
            const cityExists = await City.findById(id);
            if (!cityExists) {
                req.flash('error', 'City not found.');
                return res.redirect('/admin/city');
            }
            if (cityName) {
                const existingCity = await City.findOne({ cityName: cityName });
                if (existingCity && existingCity._id.toString() !== id) {
                    req.flash('error', 'City name already exists.');
                    return res.redirect('/admin/city');
                }
            }
            cityExists.cityName = cityName || cityExists.cityName;
            cityExists.status = status || cityExists.status;
            await cityExists.save();
    
            req.flash('success', 'City updated successfully.');
            return res.redirect('/admin/city');
        } catch (error) {
            console.error('Error updating city:', error);
            req.flash('error', 'Failed to update city. Please try again.');
            return res.redirect('/admin/dashboard');
        }
    },




}