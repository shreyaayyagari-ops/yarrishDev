const User = require('../Models/userModel');

const allowProfileSwitch = (req, res, next) => {
    const user = req.user;  
    if (['user', 'service_provider'].includes(user.role)) {
        next();  
    } else {
        res.status(403).json({ message: "Profile switching is not allowed for this role" });
    }
};

const verifyServiceProviderDocs = (req, res, next) => {
    const user = req.user;  

    if (user.role === "service_provider") {
        if (!user.aadhar_no || !user.passport_no || !user.drivers_license_no) {
            return res.status(403).json({
                message: "Document verification required to access Service Provider features."
            });
        }
    }

    next();
};


module.exports ={
    verifyServiceProviderDocs,
    allowProfileSwitch
}
