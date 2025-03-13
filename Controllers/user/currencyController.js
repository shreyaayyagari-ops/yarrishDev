const Currency = require('../../Models/Currency');
const Country = require('../../Models/Country');

module.exports = {
    createCurrency : async (req, res) => {
        try {
            const { name, code, symbol, country } = req.body;
    
          
            const countryExists = await Country.findById(country);
            if (!countryExists) {
                return res.status(404).json({ message: 'Country not found' });
            }
    
            const currency = new Currency({ name, code, symbol, country });
            await currency.save();
    
            return res.status(201).json(currency);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    getCurrencies : async (req, res) => {
        try {
            const currencies = await Currency.find().populate('country');
            return res.status(200).json(currencies);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    updateCurrency: async (req, res) => {
        const { currencyId } = req.params;
  
        try {
          
            const updatedcurrency = await Currency.findByIdAndUpdate(currencyId, req.body, { new: true });
    
            if (updatedcurrency) {
                return res.status(200).json({ message: 'currency updated successfully', updatedcurrency });
            } else {
                return res.status(404).json({ message: 'currency not found' });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

};