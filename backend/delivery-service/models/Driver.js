const mongoose = require('mongoose')

const driverSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  Number: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number] }
  },
  available: { type: Boolean, default: true },
  currentDelivery: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery' },
  vehicleType: String,
  rating: { type: Number, default: 0 }
}, { timestamps: true })

driverSchema.index({ location: '2dsphere' })

module.exports = mongoose.model('Driver', driverSchema)