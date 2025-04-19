const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  deliveryId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  driverId: { type: String, required: true },
  driverName: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "assigned", "delivering", "completed", "cancelled"],
    default: "assigned"
  },
  startLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  endLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Delivery", deliverySchema);