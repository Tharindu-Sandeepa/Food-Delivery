const Delivery = require("../models/Delivery");

// Create or assign a new delivery
exports.assignDelivery = async (req, res) => {
  try {
    const {
      deliveryId,
      orderId,
      driverId,
      driverName,
      startLocation,
      endLocation,
    } = req.body;


    const delivery = await Delivery.create({
      deliveryId,
      orderId,
      driverId,
      driverName,
      startLocation,
      endLocation,
    });
    res.status(201).json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update delivery status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const delivery = await Delivery.findOneAndUpdate(
      { deliveryId: id },
      { status, updatedAt: new Date() },
      { new: true }
    );
    res.status(200).json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Complete delivery
exports.completeDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findOneAndUpdate(
      { deliveryId: id },
      { status: "delivered", updatedAt: new Date() },
      { new: true }
    );
    res.status(200).json({ message: "Delivery marked as complete", delivery });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get delivery by ID
exports.getDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findOne({ deliveryId: id });
    if (!delivery)
      return res.status(404).json({ message: "Delivery not found" });
    res.status(200).json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get delivery by order ID
exports.getDeliveryByOrderId = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findOne({ orderId: id });
    if (!delivery)
      return res.status(404).json({ message: "Delivery not found" });
    res.status(200).json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Get delivery by driver ID
exports.getDeliveryByDriverId = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findOne({ driverId: id });
    if (!delivery)
      return res.status(404).json({ message: "Delivery not found" });
    res.status(200).json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all deliveries
exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find();
    res.status(200).json(deliveries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
