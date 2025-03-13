const City = require('../../Models/beatTheBox/city');

module.exports = {
    getCities: async (req, res) => {
        try{
            const allCities = await City.find({status: 'Active'}).sort({createdAt: -1});
            if(!allCities){
                return res.status(404).json({message: 'No city found'});
            }   
            return res.status(200).json({allCities});
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }
}