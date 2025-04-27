const Driver = require("../models/Driver");
const Delivery = require("../models/Delivery");


// Check if driver exists by userId
exports.checkDriverExists = async (req, res) => {
  try {
    const { userId } = req.params;

    const driver = await Driver.findOne({ userId: userId });
    
    if (driver) {
      return res.status(200).json({ exists: true, driver });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking driver existence:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Register new driver
exports.registerDriver = async (req, res) => {
  try {
    const { userId, name, contactNumber, vehicleType, available } = req.body;

    // Validate required fields
    if (!userId || !name || !contactNumber || !vehicleType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if driver already exists
    const existingDriver = await Driver.findOne({ userId });
    if (existingDriver) {
      return res.status(400).json({ error: 'Driver already registered with this user ID' });
    }

    // Create new driver
    const newDriver = new Driver({
      userId,
      name,
      contactNumber,
      vehicleType,
      available: available || true,
      location: {
        type: 'Point',
        coordinates: [0, 0] // Default location, update this in your application
      }
    });

    await newDriver.save();
    res.status(201).json(newDriver);
  } catch (error) {
    console.error('Error registering driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update driver information
exports.updateDriver = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, contactNumber, vehicleType, available } = req.body;

    const updatedDriver = await Driver.findOneAndUpdate(
      { userId: userId },
      {
        name,
        contactNumber,
        vehicleType,
        available,
        $set: { updatedAt: new Date() }
      },
      { new: true, runValidators: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.status(200).json(updatedDriver);
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    const driver = await Driver.findOne({ userId: req.params.id }); // Changed from find() to findOne()
    if (!driver) return res.status(404).json({ error: "Driver not found" });
    res.json(driver); // Now returns a single object instead of array
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

// exports.getDriverStats = async (req, res) => {
//   try {
//     const { driverId } = req.params;

//     if (!driverId) {
//       return res.status(400).json({ error: "Driver ID is required" });
//     }

//     console.log("Driver stats ID:", driverId);

//     // Verify driver exists
//     const driver = await Driver.find({ driverId: driverId });
//     if (!driver) {
//       return res.status(404).json({ error: "Driver not found" });
//     }

//     // Calculate stats based on deliveries
//     const now = new Date();
//     const startOfToday = new Date(now.setHours(0, 0, 0, 0));
//     const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

//     // Get all completed deliveries for this driver
//     const deliveries = await Delivery.find({
//       driverId,
//       status: "completed",
//     });

//     // Calculate earnings
//     const stats = {
//       today: deliveries
//         .filter((d) => d.createdAt >= startOfToday)
//         .reduce((sum, d) => sum + (d.deliveryFee || 0), 0),
//       week: deliveries
//         .filter((d) => d.createdAt >= startOfWeek)
//         .reduce((sum, d) => sum + (d.deliveryFee || 0), 0),
//       month: deliveries
//         .filter((d) => d.createdAt >= startOfMonth)
//         .reduce((sum, d) => sum + (d.deliveryFee || 0), 0),
//       total: deliveries.reduce((sum, d) => sum + (d.deliveryFee || 0), 0),
//     };

//     res.json(stats);
//   } catch (error) {
//     console.error("Error getting driver stats:", error);
//     res.status(500).json({ error: "Failed to get driver stats" });
//   }
// };


// Get driver stats with detailed chart data


exports.getDriverStats = async (req, res) => {
  try {
    const driverId = req.params.driverId;

    if (!driverId) {
      return res.status(400).json({ error: "Driver ID is required" });
    }

    console.log("Fetching stats for driver:", driverId);

    // Verify driver exists
    const driver = await Driver.findOne({ userId: driverId });
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }

    // Calculate time periods
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get all completed deliveries for this driver
    const deliveries = await Delivery.find({
      driverId,
      status: "completed"
    }).sort({ createdAt: -1 }); // Sort by most recent first

    // Calculate summary earnings
    const totalEarnings = deliveries.reduce((sum, d) => sum + (d.deliveryFee || 0), 0);
    const todayEarnings = deliveries
      .filter(d => d.createdAt >= startOfToday)
      .reduce((sum, d) => sum + (d.deliveryFee || 0), 0);
    const weekEarnings = deliveries
      .filter(d => d.createdAt >= startOfWeek)
      .reduce((sum, d) => sum + (d.deliveryFee || 0), 0);
    const monthEarnings = deliveries
      .filter(d => d.createdAt >= startOfMonth)
      .reduce((sum, d) => sum + (d.deliveryFee || 0), 0);

    // Calculate hourly earnings for today
    const hourlyData = Array(24).fill(0).map((_, index) => ({
      hour: index,
      earnings: 0
    }));

    deliveries
      .filter(d => d.createdAt >= startOfToday)
      .forEach(delivery => {
        const hour = new Date(delivery.createdAt).getHours();
        hourlyData[hour].earnings += delivery.deliveryFee || 0;
      });

    // Calculate daily earnings for the week
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyData = Array(7).fill(0).map((_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - now.getDay() + index);
      return {
        date: days[index],
        fullDate: date.toISOString().split('T')[0],
        earnings: 0
      };
    });

    deliveries
      .filter(d => d.createdAt >= startOfWeek)
      .forEach(delivery => {
        const dayIndex = new Date(delivery.createdAt).getDay();
        dailyData[dayIndex].earnings += delivery.deliveryFee || 0;
      });

    // Calculate delivery types
    // For this example, we'll categorize by fee range as we don't have delivery type in the model
    const deliveryTypes = [
      { type: 'Small (< $10)', count: 0 },
      { type: 'Medium ($10-$20)', count: 0 },
      { type: 'Large (> $20)', count: 0 }
    ];

    deliveries.forEach(delivery => {
      if (delivery.deliveryFee < 10) {
        deliveryTypes[0].count++;
      } else if (delivery.deliveryFee <= 20) {
        deliveryTypes[1].count++;
      } else {
        deliveryTypes[2].count++;
      }
    });

    // Calculate average delivery time (using createdAt and updatedAt as proxy)
    let totalDeliveryTime = 0;
    let completedDeliveries = 0;

    deliveries.forEach(delivery => {
      if (delivery.status === "completed") {
        const deliveryTime = new Date(delivery.updatedAt) - new Date(delivery.createdAt);
        totalDeliveryTime += deliveryTime;
        completedDeliveries++;
      }
    });

    const avgDeliveryTime = completedDeliveries > 0 
      ? Math.round(totalDeliveryTime / completedDeliveries / 60000) // Convert to minutes
      : 0;

    // Get recent deliveries (last 5)
    const recentDeliveries = deliveries.slice(0, 5).map(delivery => ({
      id: delivery.deliveryId,
      orderId: delivery.orderId,
      status: delivery.status,
      fee: delivery.deliveryFee,
      time: delivery.createdAt
    }));

    const stats = {
      // Summary stats
      today: todayEarnings,
      week: weekEarnings,
      month: monthEarnings,
      total: totalEarnings,
      
      // Chart data
      hourly: hourlyData,
      daily: dailyData,
      deliveriesByType: deliveryTypes,
      
      // Performance metrics
      deliveryCount: deliveries.length,
      avgDeliveryTime,
      
      // Recent activity
      recentDeliveries
    };

    res.json(stats);
  } catch (error) {
    console.error("Error getting driver stats:", error);
    res.status(500).json({ error: "Failed to get driver stats" });
  }
};

// Get recent deliveries for a driver
exports.getRecentDeliveries = async (req, res) => {
  try {
    const driverId = req.params.userId;
    const limit = parseInt(req.query.limit) || 5;

    if (!driverId) {
      return res.status(400).json({ error: "Driver ID is required" });
    }

    const deliveries = await Delivery.find({ driverId })
      .sort({ createdAt: -1 })
      .limit(limit);

    const formattedDeliveries = deliveries.map(delivery => ({
      id: delivery.deliveryId,
      orderId: delivery.orderId,
      status: delivery.status,
      fee: delivery.deliveryFee,
      createdAt: delivery.createdAt,
      updatedAt: delivery.updatedAt,
      startLocation: delivery.startLocation,
      endLocation: delivery.endLocation
    }));

    res.json(formattedDeliveries);
  } catch (error) {
    console.error("Error getting recent deliveries:", error);
    res.status(500).json({ error: "Failed to get recent deliveries" });
  }
};

// Get driver delivery heatmap data
exports.getDeliveryHeatmap = async (req, res) => {
  try {
    const driverId = req.params.userId;
    const timeFrame = req.query.timeFrame || 'week'; // 'day', 'week', 'month'

    if (!driverId) {
      return res.status(400).json({ error: "Driver ID is required" });
    }

    // Calculate time period
    const now = new Date();
    let startDate;
    
    switch (timeFrame) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    }

    // Get all deliveries in the time period
    const deliveries = await Delivery.find({
      driverId,
      createdAt: { $gte: startDate }
    });

    // Format data for heatmap (assuming frontend will use this for visualization)
    const heatmapData = deliveries.map(delivery => ({
      startLoc: delivery.startLocation,
      endLoc: delivery.endLocation,
      fee: delivery.deliveryFee,
      status: delivery.status,
      timestamp: delivery.createdAt
    }));

    res.json(heatmapData);
  } catch (error) {
    console.error("Error getting delivery heatmap:", error);
    res.status(500).json({ error: "Failed to get delivery heatmap" });
  }
};

// Get earnings trend data
exports.getEarningsTrend = async (req, res) => {
  try {
    const driverId = req.params.userId;
    const period = req.query.period || 'week'; // 'week', 'month', 'year'

    if (!driverId) {
      return res.status(400).json({ error: "Driver ID is required" });
    }

    const now = new Date();
    let startDate, format, groupByFormat;
    
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        format = '%Y-%m-%d';
        groupByFormat = { $dateToString: { format, date: '$createdAt' } };
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        format = '%Y-%m-%d';
        groupByFormat = { $dateToString: { format, date: '$createdAt' } };
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        format = '%Y-%m';
        groupByFormat = { $dateToString: { format, date: '$createdAt' } };
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        format = '%Y-%m-%d';
        groupByFormat = { $dateToString: { format, date: '$createdAt' } };
    }

    // Aggregate earnings by time period
    const trendsData = await Delivery.aggregate([
      {
        $match: {
          driverId,
          status: "completed",
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupByFormat,
          earnings: { $sum: '$deliveryFee' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Format response
    const formattedTrends = trendsData.map(item => ({
      date: item._id,
      earnings: item.earnings,
      deliveries: item.count
    }));

    res.json(formattedTrends);
  } catch (error) {
    console.error("Error getting earnings trend:", error);
    res.status(500).json({ error: "Failed to get earnings trend" });
  }
};


exports.getDeliveryRoute = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({ deliveryId: req.params.deliveryId });
    
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Get route from OpenRouteService
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${process.env.ORS_API_KEY}&start=${delivery.startLocation.lng},${delivery.startLocation.lat}&end=${delivery.endLocation.lng},${delivery.endLocation.lat}`
    );
    
    const data = await response.json();
    const coordinates = data.features[0].geometry.coordinates;
    const points = coordinates.map(coord => [coord[1], coord[0]]);
    
    res.json({ route: points });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get route' });
  }
}

exports.getDriverCurrentPossition = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({ deliveryId: req.params.deliveryId });
    const driver = await Driver.findOne({ userId: delivery.driverId });
    
    res.json({
      lat: driver.location.coordinates[1],
      lng: driver.location.coordinates[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get position' });
  }
}