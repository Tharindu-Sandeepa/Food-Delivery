const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  items: [{ name: String, quantity: Number, price: Number }],
  total: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);