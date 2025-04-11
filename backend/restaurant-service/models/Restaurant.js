const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);