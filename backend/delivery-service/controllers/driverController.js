const Driver = require("../models/Driver");

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
    const driver = await Driver.findByIdAndUpdate({ userId: req.params.id }, req.body, {
      new: true,
    });
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
