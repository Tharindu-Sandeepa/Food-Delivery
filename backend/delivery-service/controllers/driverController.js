const Driver = require("../models/Driver");
const Delivery = require("../models/Delivery");

// Create a new driver
exports.createDriver = async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a driver by ID
exports.getDriver = async (req, res) => {
  console.log("Driver ID:", req.params.id);

  try {
    const driver = await Driver.find({ userId: req.params.id });
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a driver
exports.updateDriver = async (req, res) => {
  try {
    console.log("Driver ID for available update:", req.params.id);
    const driver = await Driver.findOneAndUpdate(
      { userId: req.params.id },
      req.body,
      {
        new: true,
      }
    );
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a driver
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    res.json({ message: "Driver deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Find nearest available driver
exports.findNearestDriver = async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const driver = await Driver.findOne({
      available: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 5000,
        },
      },
    });

    if (!driver) {
      return res.status(404).json({ error: "No nearby drivers available" });
    }

    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDriverStats = async (req, res) => {
  try {
    const { driverId } = req.params;

    if (!driverId) {
      return res.status(400).json({ error: "Driver ID is required" });
    }

    console.log("Driver stats ID:", driverId);

    // Verify driver exists
    const driver = await Driver.find({ driverId: driverId });
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // Calculate stats based on deliveries
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all completed deliveries for this driver
    const deliveries = await Delivery.find({
      driverId,
      status: "completed",
    });

    // Calculate earnings
    const stats = {
      today: deliveries
        .filter((d) => d.createdAt >= startOfToday)
        .reduce((sum, d) => sum + (d.deliveryFee || 0), 0),
      week: deliveries
        .filter((d) => d.createdAt >= startOfWeek)
        .reduce((sum, d) => sum + (d.deliveryFee || 0), 0),
      month: deliveries
        .filter((d) => d.createdAt >= startOfMonth)
        .reduce((sum, d) => sum + (d.deliveryFee || 0), 0),
      total: deliveries.reduce((sum, d) => sum + (d.deliveryFee || 0), 0),
    };

    res.json(stats);
  } catch (error) {
    console.error("Error getting driver stats:", error);
    res.status(500).json({ error: "Failed to get driver stats" });
  }
};
