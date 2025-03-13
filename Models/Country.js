const { mongoose, Schema, model } = require('mongoose')

const CountrySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: false
    },
    status: {
        type: String,
        default:'Active',
        required: true,

    classification : {
        type: String,
        required: true,
        default : "B"

    } 
    }
    
},{timestamps: true},
 { toJSON: { virtuals: true }});

CountrySchema.virtual("icon_path").get(function () {
    return `https://test-bucket-jonnas.s3.ap-south-1.amazonaws.com/${this.icon}`;
});

const Country = model('Country', CountrySchema);
module.exports = Country