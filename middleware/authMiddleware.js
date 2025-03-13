const session = require("express-session");
const User = require("../Models/userModel");
const Subscriber = require('../Models/subscriber');
const jwt = require("jsonwebtoken");



exports.validPassword = function (password) {
    const passwordRegex = /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,14}$/;

    if (!passwordRegex.test(password)) {
        return {
            isValid: false,
            message: "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character, and be 8-14 characters long."
        };
    }

    return { isValid: true };
};

// exports.isSubscriberActive = async (req, res, next) => {
//     try {
//         const subscriber = await User.findOne({ user: req.user._id });
//         if (!subscriber) {
//             return res.status(404).json({ message: 'Subscriber not found' });
//         }
//         if (subscriber.suvscription_status !== true) {
//             return res.status(422).json({
//               message: 'Access denied. Subscription is not active',
//               subscription_status: false,
//             });
//           }
//           next();
//         } catch (err) {
//           console.error(err);
//           return res.status(500).json({ message: 'Internal server error', subscription_status: false });
//         }
//       };

exports.bindUserWithRequest = () => {
    return async (req, res, next) => {
        if (!req.session.isLoggedIn) {
            return next()
        }

        try {
            const user = await User.findById(req.session.user._id)
            req.user = user
            req.isLoggedIn = true
            //console.log('req user', req.user)
            next()
        } catch (error) {
            //console.log(error)
            next(error)
        }

    }
}

exports.isAuthenticated = async (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/auth/login')
    }
    const user = await User.findOne({ _id: req.session.user._id, isAdmin: false });
    if (!user) {
        return res.redirect('/admin/dashboard');
    }
    next();
}

exports.isAdmin = async (req, res, next) => {
    if (!req.session.isAuth) {
        return res.redirect("/auth/login");
    }
    const admin = await User.findOne({ _id: req.session.admin._id, role: "admin" });
    if (!admin) {
        req.flash("error", "You don't have admin access...");
        return res.redirect("/auth/login");
    }
    if (admin.status === "Inactive") {
        req.flash("error", "Your account is freezed");
        return res.redirect(("/auth/login"));
    }
    req.session.admin = admin;
    next();
}

exports.isUnAuthenticated = async (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/user/dashboard');
    }
    else {
        req.flash("error", "Unauthorized user");
        return res.redirect("/auth/login");
    }
    next();
};


exports.generateToken = (user) => {
    const secretKey = process.env.JWT_SECRET;
    //console.log(secretKey);

    if (!secretKey) {
        throw new Error('JWT secret key is not defined');
    }

    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            activeRole: user.activeRole
        },
        secretKey,
        { expiresIn: '60d' }
    );
};




exports.validPhoneNumber = (phone) => {
    if (!phone) {
        return { status: 400, error: "Invalid Phone Number", message: "Phone number is required." };
    }
    const phoneNumberString = phone.toString().trim();
    if (phoneNumberString.length !== 10) {
        return { status: 400, error: "Invalid Phone Number", message: "Phone number must be 10 digits long." };
    }
    if (!/^\d+$/.test(phoneNumberString)) {
        return { status: 400, error: "Invalid Phone Number", message: "The phone number must only be a 10-digit numerical value. Please enter a valid phone number." };
    }
    if (!/^[6789]/.test(phoneNumberString)) {
        return { status: 400, error: "Invalid Phone Number", message: "Phone number must start with 6, 7, 8, or 9." };
    }
    return false;
};

exports.isValidPassword = (password) => {
    if (password.length < 8 || password.length > 14) {
        return { status: 400, error: "Invalid Password Format", message: "The password must be 8-14 characters long" };
    }
    if (!/[A-Z]/.test(password)) {
        return { status: 400, error: "Invalid Password Format", message: "The password must include at least 1 uppercase letter." };
    }
    if (!/[a-z]/.test(password)) {
        return { status: 400, error: "Invalid Password Format", message: "The password must include at least 1 lowercase letter." };
    }
    if (!/\d/.test(password)) {
        return { status: 400, error: "Invalid Password Format", message: "The password must include at least 1 number." };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { status: 400, error: "Invalid Password Format", message: "The password must include at least 1 special character." };
    }
    return false;
};

exports.validEmail = async (email) => {
    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0) {
        return { status: 422, error: "Empty email address", message: "Email address is required and cannot be empty. Please provide a valid email address" };
    }
    if (/^[!#$%&'*+/=?^_`{|}~.]/.test(trimmedEmail)) {
        return { status: 400, error: "Invalid email format", message: "Invalid email format. Email addresses cannot start with a special character or period. Please enter a valid email address." };
    }
    if (email !== trimmedEmail) {
        return { status: 400, error: "Invalid email", message: "Email contains leading or trailing spaces" };
    }
    if (!email || email.length === 0) {
        return { status: 422, message: "Invalid email" };
    }
    if (email !== email.trim()) {
        return { status: 400, error: "Invalid email", message: "Email contains leading or trailing spaces" };
    }
    if (trimmedEmail !== trimmedEmail.toLowerCase()) {
        return { status: 409, error: "Invalid email case", message: "Email addresses are case-insensitive. Please enter the email address in lowercase." };
    }
    // const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    // const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z][A-Za-z0-9-]*(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,4}$/;
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,6}$/;
    if (!emailRegex.test(trimmedEmail)) {
        return { status: 400, error: "Invalid email", message: "Please provide a valid email address." };
    }
    const allowedDomains = [
        // Common TLDs
        '.com', '.net', '.org', '.edu', '.gov', '.mil', '.int', '.co', '.io',
        // Country Code TLDs (ccTLDs)
        '.us', '.uk', '.ca', '.in', '.au', '.de', '.jp', '.cn', '.ru', '.br',
        // Newer gTLDs
        '.tech', '.biz', '.info', '.xyz', '.online', '.store', '.ai', '.app', '.dev',
        // Specific Purpose TLDs
        '.health', '.law', '.news', '.music',
        // Restricted TLDs
        '.bank', '.edu', '.gov', '.mil',
        // Additional Country Code TLDs (for completeness)
        '.fr', '.es', '.it', '.nl', '.mx', '.ch', '.se', '.no', '.fi', '.pl', '.gr',
        '.dk', '.cz', '.pt', '.tr', '.za', '.ar', '.nz', '.sg', '.hk', '.my', '.id',
        '.th', '.ph', '.kr', '.tw', '.ae', '.sa', '.eg', '.il', '.qa', '.ng',
        // More specific or newer gTLDs (optional)
        '.design', '.photography', '.media', '.finance', '.marketing', '.consulting',
        '.solutions', '.digital', '.agency', '.ventures', '.guru', '.expert', '.club'
    ];
    // return { status: 400, error: "Invalid email format", message: "Invalid email format. Please ensure your email address does not contain multiple domain parts." };
    const domainParts = trimmedEmail.split('@')[1]?.split('.');
    const topLevelDomain = `.${domainParts[domainParts.length - 1]}`;
    if (!allowedDomains.includes(topLevelDomain)) {
        return { status: 400, error: "Invalid email format", message: `Only standard domains are allowed. The provided domain '${topLevelDomain}' is not valid.` };
    }
    // if (!emailRegex.test(trimmedEmail)) {
    //     const domainParts = trimmedEmail.split('@')[1]?.split('.');
    //     if (domainParts && domainParts.length > 2 && domainParts[domainParts.length - 2] === domainParts[domainParts.length - 1]) {
    //     }
    //     return { status: 400, error: "Invalid email", message: "Please provide a valid email address." };
    // }
    return false;
};

// exports.handleFileUpload = async (file, destination) => { //file = winnerPicture, destination = winners
//     if (!file) return null;
//     const extension = path.extname(file.name);  // extension = .png
//     const filename = `${Date.now()}${extension}`;  // filename = `1717223132312.png`
//     await file.mv(`./images/${destination}/${filename}`); //  winnerPicture.mv("images/winners/1717223132312.png")
//     return `images/${destination}/${filename}`; //images/winners/1717223132312.png
// };


