const { mongoose, Schema, model } = require('mongoose');

const ServiceSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    icon_path: {
        type: String,
        required: true
    },

    status: {
        type: String,
        default: 'Active',
        required: true

    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    // preference: {
    //     type: Boolean,
    //     default: false 
    // }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// Virtual property to return the full icon path
ServiceSchema.virtual("full_icon_path").get(function () {
    return `https://test-bucket-jonnas.s3.ap-south-1.amazonaws.com/${this.icon}`;
});

const Service = model('Service', ServiceSchema);
module.exports = Service;
