const Executive = require('../../../Models/Executive');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { generateRandomPassword } = require('../../../middleware/LoginMiddleware');
const {sendMailCredentials} = require('../../../middleware/LoginMiddleware');

module.exports = {
    executive: async (req, res) => {
        try {
            const executive = await Executive.find({ role: 'executive' });
            // console.log(executive)

            return res.render("executive", {
                allexecutive: executive,
                success: req.flash("success"),
                error: req.flash("error"),
            });
        } catch (error) {
            //console.log(error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/dashboard");
        }
    },

    addExecutive: async (req, res) => {
        try {
            const { name, email, phone } = req.body;
            // const existingExecutive = await Executive.findOne({ $or: [{ email }, { phone }] });
            // if (existingExecutive) {
            //     req.flash("error", "Executive with this email or phone already exists");
            //     return res.redirect("/admin/executive");
            // }
            const plainPassword = await generateRandomPassword();
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            const newExecutive = new Executive({
                name,
                email,
                phone,
                password: hashedPassword,
            });
            const emailSent = await sendMailCredentials(email, name, plainPassword);
            if (!emailSent) {
                req.flash("error", "Error sending credentials email");
                return res.redirect("/admin/executive");
            }
            await newExecutive.save();
            req.flash("success", "Executive added successfully, credentials sent via email");
            return res.redirect(`/admin/executive`);
        } catch (error) {
            console.error("Error in creating executive:", error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/executive");
        }
    },


    updateExecutive: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, phone } = req.body;
    
            const executive = await Executive.findById(id);
            if (!executive) {
                req.flash("error", "Executive not found");
                return res.redirect("/admin/executive");
            }
    
            const conflictingExecutive = await Executive.findOne({
                $or: [{ email }, { phone }],
                _id: { $ne: id },
            });
            if (conflictingExecutive) {
                req.flash("error", "Another executive with this email or phone already exists");
                return res.redirect(`/admin/executive/edit/${id}`);
            }
    
            let emailUpdated = email && email !== executive.email;
    
            executive.name = name || executive.name;
            executive.email = email || executive.email;
            executive.phone = phone || executive.phone;
    
            if (emailUpdated) {
                const plainPassword = await generateRandomPassword();
                const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
                executive.password = hashedPassword;
    
                const emailSent = await sendMailCredentials(email, name || executive.name, plainPassword);
                if (!emailSent) {
                    req.flash("error", "Error sending updated credentials email");
                    return res.redirect(`/admin/executive/edit/${id}`);
                }
    
                req.flash("success", "Executive updated successfully, new credentials sent via email");
            } else {
                req.flash("success", "Executive updated successfully");
            }
    
            await executive.save();
    
            return res.redirect("/admin/executive");
        } catch (error) {
            console.error("Error in updating executive:", error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/executive");
        }
    }
    ,


    deleteExecutive : async (req, res) => {
        try {
            const { id } = req.params;
            const executive = await Executive.findById(id);
            if (!executive) {
                req.flash("error", "Executive not found");
                return res.redirect("/admin/executive");
            }
            await Executive.findByIdAndDelete(id);
            req.flash("success", "Executive deleted successfully");
            return res.redirect("/admin/executive");
        } catch (error) {
            console.error("Error in deleting executive:", error);
            req.flash("error", "Internal server error");
            return res.redirect("/admin/executive");
        }
    }


    


    



}