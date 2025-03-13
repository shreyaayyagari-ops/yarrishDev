const mongoose = require('mongoose');

const selectedCategorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }],
  categories: [
    {
      name: { type: String },
      icon: { type: String }
    }
  ]
}, { timestamps: true });

const SelectedCategory = mongoose.model('SelectedCategory', selectedCategorySchema);

module.exports = SelectedCategory;
