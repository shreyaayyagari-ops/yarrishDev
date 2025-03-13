const bcrypt = require("bcryptjs");

const user = require('../../Models/userModel.js');
const settings = require("../../models/adminModels/settingsModel.js");

module.exports = {
    index: async (req, res) => {
        try {
            return res.render("index", {
                success: req.flash("success"),
                error: req.flash("error")
            })
        } catch (error) {
            req.flash("error", "Internal server error");
            return res.redirect("/auth/login");
        }
    },
    login: async (req, res) => {
        try {
            const phone = req.body.email;
            if(!email || !password) {
                req.flash("error", "Invalid fields");
                return res.redirect("/auth/login");
            }
            const adminExists = await user.findOne({ email });
            if (!adminExists || !adminExists.isAdmin) {
                req.flash("error", "You dont have admin access");
                return res.redirect(("/auth/login"));
            }
            const matchedPassword = await bcrypt.compare(password, adminExists.password);
            if (!matchedPassword) {
                req.flash("error", "Password is wrong");
                return res.redirect("/auth/login");
            }
            req.session.isAuth = true;
            req.session.admin = adminExists;
            req.session.save(err => {
                if (err) {
                    return next(err);
                }
                return res.redirect("/admin/dashboard");
            })
        } catch (error) {
            //console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/auth/login");
        }
    },
    logout: async (req, res) => {
        try {
            req.session.destroy();
            return res.redirect("/auth/login");
        } catch (error) {
            //console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/auth/login");
        }
    }
}