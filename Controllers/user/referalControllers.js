// const User = require('../../Models/userModel');
// const Referral = require('../../Models/Referral');
// const jwt = require("jsonwebtoken");

// module.exports = {
//     useReferralCode: async (req, res) => {
//         try {
//             const token = req.headers.authorization.split(' ')[1];
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             const userId = decoded.id;
            
//             const { referralCode, serviceProviderId } = req.body;
        
//             const referredUser = await User.findOne({ referralCode });
//             if (!referredUser) {
//                 return res.status(404).json({ message: "Invalid referral code" });
//             }
        
//             const serviceProvider = await User.findById(serviceProviderId);
//             if (!serviceProvider) {
//                 return res.status(404).json({ message: "Service provider not found" });
//             }
        
//             if (serviceProvider.referralUsed) {
//                 return res.status(400).json({ message: "Referral code already used" });
//             }
        
//             serviceProvider.referralUsed = true;
//             await serviceProvider.save();
        
//             const newReferral = new Referral({
//                 code: referralCode,
//                 userId: userId,    
//                 rewardAmount: 100, 
//                 usageCount: 1, 
//             });
        
//             await newReferral.save();
        
//             return res.status(200).json({
//                 message: "Referral code applied successfully"
//             });
//         } catch (error) {
//             return res.status(500).json({ message: "Internal Server Error", error: error.message });
//         }
//     }
    
// }