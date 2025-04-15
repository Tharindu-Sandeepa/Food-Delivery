const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  deliveryId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  driverId: { type: String, required: true },
  driverName: { type: String },
  status: {
    type: String,
    enum: ["assigned", "on_the_way", "delivered"],
    default: "assigned"
  },
  startLocation: {
    lat: Number,
    lng: Number
  },
  endLocation: {
    lat: Number,
    lng: Number
  },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Delivery", deliverySchema);
