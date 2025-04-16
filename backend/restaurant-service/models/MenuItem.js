const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Restaurant', 
    required: true 
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String, required: true }, 
  imageUrl: { type: String },
  isVegetarian: { type: Boolean, default: false },
  isVegan: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);