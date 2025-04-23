const Delivery = require("../models/Delivery");
const Driver = require("../models/Driver");

const BASE_URL = "http://localhost:3001/api/orders";

// Create or assign a new delivery
// exports.assignDelivery = async (req, res) => {
//   try {
//     const {
//       deliveryId,
//       orderId,
//       driverId,
//       driverName,
//       startLocation,
//       endLocation,
//     } = req.body;

//     const delivery = await Delivery.create({
//       deliveryId,
//       orderId,
//       driverId,
//       driverName,
//       startLocation,
//       endLocation,
//     });
//     res.status(201).json(delivery);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

const axios = require("axios");

exports.assignDriver = async (req, res) => {
  try {

    console.log("delivery assigned start");
    
      const { orderId, deliveryAddress, startLocation, deliveryFee } = req.body;

      // Validate required fields
      if (!deliveryAddress || !deliveryAddress.lat || !deliveryAddress.lng || !deliveryFee) {
        console.log("Invalid delivery address coordinates")
        throw { message: "Invalid delivery address coordinates", statusCode: 400 };
      }

      // 1. Find nearest available driver
      const driver = await Driver.findOne({
        available: true,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [startLocation.lng, startLocation.lat],
            },
            $maxDistance: 5000, // 5km radius
          },
        },
      });

      if (!driver) {
        console.log("No available drivers")
        throw { message: "No available drivers", statusCode: 404 };
      }

      // 2. Create delivery record
      const delivery = new Delivery({
        deliveryId: `d-${Date.now()}`,
        orderId,
        deliveryFee: Number(deliveryFee),
        driverId: driver.userId,
        driverName: driver.name,
        status: "assigned",
        startLocation: {
          lat: startLocation.lat,
          lng: startLocation.lng,
        },
        endLocation: {
          lat: deliveryAddress.lat,
          lng: deliveryAddress.lng,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await delivery.save();

      // 3. Update driver status
      driver.available = false;
      driver.currentDelivery = delivery._id;
      await driver.save();

      // 4. Notify Order Service via HTTP
      try {
        await axios.post(`${BASE_URL}/driver-assigned`, {
          orderId,
          deliveryId: delivery.deliveryId,
          driverId: driver.userId,
          driverName: driver.name,
          contactNumber: driver.contactNumber,
        });
      } catch (axiosError) {
        console.log("Failed to notify order service")
        throw { 
          message: `Failed to notify order service: ${axiosError.message}`,
          statusCode: 502
        };
      }

      if (delivery) {
        res.json({
          ...delivery.toObject(),
          driverName: driver.name,
        });
      }
    } catch (error) {
      console.log({ message: error.message })
      res.status(500).json({ message: error.message });
    }
};

// Update delivery status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("Updating delivery status:", id, status);
    const delivery = await Delivery.findOneAndUpdate(
      { deliveryId: id },
      { status, updatedAt: new Date() },
      { new: true }
    );

    //update order status
    try {
      await axios.patch(`${BASE_URL}/delivery-complete`, {
        deliveryId: id,
        status,
      });
    } catch (axiosError) {
      console.error("Failed to notify order service:", axiosError.message);
      return res.status(502).json({ message: "Failed to notify order service" });
    }

    res.status(200).json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Complete delivery
exports.completeDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { endLocation } = req.body
    const { driverId } = req.body

    console.log("Completing delivery:", id, status);


    // Update driver status to available and location
    const driver = await Driver.findOneAndUpdate(
      { userId: driverId },
      { available: true, currentDelivery: null, location: { type: "Point", coordinates: [endLocation.lng, endLocation.lat] } },
      { new: true }
    );

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    //update order status
    try {
      await axios.patch(`${BASE_URL}/delivery-complete`, {
        deliveryId: id,
        status: "completed",
      });
    } catch (axiosError) {
      console.error("Failed to notify order service:", axiosError.message);
      return res.status(502).json({ message: "Failed to notify order service" });
    }

    // Update delivery status
    const delivery = await Delivery.findOneAndUpdate(
      { deliveryId: id },
      { status, updatedAt: new Date() },
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
};

// Get delivery by driver ID
exports.getDeliveryByDriverId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Driver ID:", id);
    const delivery = await Delivery.find({ driverId: id });
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
