// Order Model
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  restaurantName: { type: String, required: true },
  items: { type: [itemSchema], required: true },
  total: { type: Number, required: true },
  subTotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  deliveryAddress: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
  },
  restaurantLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true },
  },
  deliveryPersonId: { type: String },
  deliveryId: { type: String },
  status: {
    type: String,
    enum: ["pending", "preparing", "assigned", "delivering", "completed", "cancelled"],
    default: "pending",
  },
  paymentMethod: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
