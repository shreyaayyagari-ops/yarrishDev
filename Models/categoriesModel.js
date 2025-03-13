const mongoose = require('mongoose');

const CategoriesSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        drivingLicense: {
            type: Boolean,
            default: false,
            required: false
        },
        status: {
            type: String,
            default: 'Active',
            required: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true } 
    }
);

const Category = mongoose.model('Category', CategoriesSchema);
module.exports = Category;