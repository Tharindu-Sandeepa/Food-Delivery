const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } 
  },
  cuisineType: { type: String, required: true },
  openingHours: {
    open: { type: String, required: true },
    close: { type: String, required: true }
  },
  deliveryZones: [{ type: String }], 
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

restaurantSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Restaurant', restaurantSchema);