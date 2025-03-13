const Address = require('../../Models/address');
const { isSubscriberActive } = require('../../middleware/authMiddleware');
const User = require('../../Models/userModel');
const jwt = require("jsonwebtoken");

//

module.exports = {
  addAddress: async (req, res) => {
    try {

      const { address = "", latitude = "", longitude = "" } = req.body;
      const userId = req.userId

      const createdAddress = await Address.create({
        userId,
        address,
        latitude,
        longitude,
      });

      const user = await User.findByIdAndUpdate(
        userId,
        { address: createdAddress._id },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      return res.status(201).json({
        message: 'Address added suessfully',
        address: {
          id: createdAddress._id,
          address: createdAddress.address || "",
          latitude: createdAddress.latitude || "",
          longitude: createdAddress.longitude || ""
        }
      });

    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  defaultAddress: async (req, res) => {
    try {
      const { addressId } = req.params;
      const userId = req.userId

      await Address.updateMany({ userId }, { $set: { status: false } });

      const updatedAddress = await Address.findOneAndUpdate(
        { _id: addressId, userId },
        { $set: { status: true } },
        { new: true }
      );

      if (!updatedAddress) return res.status(404).json({ status: false });

      return res.status(200).json({
        message: 'Default address updated successfully.',
        // status: true,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  select_location: async (req, res) => {
    try {
      const serviceProviderId = req.userId;
      const subscriber = await User.findById(serviceProviderId);
      if (!subscriber) {
        return res.status(404).json({ message: 'User not found' });
      }
      const addresses = req.body;
      if (!Array.isArray(addresses) || addresses.length === 0) {
        return res.status(400).json({ message: 'At least one address is required.' });
    }
    if (addresses.length > 5) {
        return res.status(400).json({ message: 'You can only select up to 5 locations.' });
    }
    const formattedAddresses = addresses.slice(0, 5).map(addr => {
        if (!addr.address || typeof addr.address !== 'string') {
            throw new Error('Address is required and must be a non-empty string.');
        }
        if (typeof addr.latitude !== 'number' || addr.latitude < -90 || addr.latitude > 90) {
            throw new Error(`Invalid latitude: ${addr.latitude}. Must be between -90 and 90.`);
        }
        if (typeof addr.longitude !== 'number' || addr.longitude < -180 || addr.longitude > 180) {
            throw new Error(`Invalid longitude: ${addr.longitude}. Must be between -180 and 180.`);
        }
        return {
            address: addr.address,
            latitude: addr.latitude,
            longitude: addr.longitude,
            serviceProviderId,
            userId: serviceProviderId,
        };
    });
      await Address.insertMany(formattedAddresses);
      const updatedUser = await User.findByIdAndUpdate(
        serviceProviderId,
        { screen_status: 'proof_verification' },
        { new: true }
      );
      return res.status(200).json({
        message: 'Addresses added successfully',
        sp_authenticated: updatedUser.sp_authenticated,
        screen_status: updatedUser.screen_status,
        passport_status: updatedUser.passport_status,
        aadhar_status: updatedUser.aadhar_status,
        driving_license_status: updatedUser.driving_license_status,
        subscription_status: updatedUser.subscription_status,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  ,


  get_all_locations: async (req, res) => {
    try {
      const serviceProviderId = req.userId

      const locations = await Address.find({ serviceProviderId }).sort({ createdAt: -1 });

      if (!locations || locations.length === 0) {
        return res.status(404).json({ message: 'Locations not found' });
      }

      return res.status(200).json({
        success: true,
        locations: locations,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  getAddress: async (req, res) => {

    try {
      const { addressId } = req.params;
      const userId = req.userId
      const address = await Address.findById(addressId).populate('user').exec();
      if (!address) {
        return res.status(404).json({ message: 'Address not found' });
      }
      if (address.user._id.toString() !== userId) {
        return res.status(403).json({ message: 'Access denied: This address does not belong to the current user' });
      }
      return res.status(200).json(address);

    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },
  //     updateAddress: async (req, res) => {
  //       const { addressId } = req.params;

  //       try {

  //           const updatedAddress = await Address.findByIdAndUpdate(addressId, req.body, { new: true });

  //           if (updatedAddress) {
  //               res.status(200).json({ message: 'Address updated successfully', updatedAddress });
  //           } else {
  //               res.status(404).json({ message: 'Address not found' });
  //           }
  //       } catch (error) {
  //           res.status(500).json({ message: 'Error updating address', error: error.message });
  //       }
  //   },


  getAllAddresses: async (req, res) => {
    try {

      const userId = req.userId
      const addresses = await Address.find({ userId }).sort({ createdAt: -1 });
      console.log(addresses);
      return res.status(200).json({
        success: true,
        data: addresses
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  deleteAddress: async (req, res) => {
    try {
      const { addressId } = req.params;
      const deletedAddress = await Address.findByIdAndDelete(addressId);
      if (deletedAddress) {
        return res.status(200).json({ message: 'Address deleted successfully' });

      } else {
        return res.status(404).json({ message: 'Address not found' });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }


}