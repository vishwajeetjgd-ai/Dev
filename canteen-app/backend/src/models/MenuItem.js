const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: 100,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      default: '', // URL to image
    },
    category: {
      type: String,
      enum: ['snacks', 'beverages', 'meals', 'desserts', 'combo'],
      required: [true, 'Category is required'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    prepTime: {
      type: Number,
      required: [true, 'Preparation time is required'],
      min: [1, 'Prep time must be at least 1 minute'],
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Text index for search functionality
menuItemSchema.index({ name: 'text', description: 'text' });
menuItemSchema.index({ category: 1, isAvailable: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
