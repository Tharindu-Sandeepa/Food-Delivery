const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const Review = require("../models/Review");
const mongoose = require("mongoose");

// CREATE Restaurant
const addRestaurant = async (req, res) => {
  try {
    const { name, address, email, location, cuisineType, openingHours, deliveryZones } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const restaurant = new Restaurant({
      name,
      address,
      email,
      location: {
        type: "Point",
        coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)],
      },
      cuisineType,
      openingHours: JSON.parse(openingHours),
      deliveryZones: deliveryZones ? deliveryZones.split(",").map((zone) => zone.trim()) : [],
      imageUrl,
    });

    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    console.error("Error adding restaurant:", error.message);
    if (error.code === 11000 && error.keyPattern.email) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// READ All Restaurants
const getRestaurants = async (req, res) => {
  try {
    const { cuisine, minRating, deliveryZone } = req.query;
    const filter = { isAvailable: true };

    if (cuisine) filter.cuisineType = cuisine;
    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (deliveryZone) filter.deliveryZones = deliveryZone;

    const restaurants = await Restaurant.find(filter);
    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// READ Single Restaurant by ID
const getRestaurantById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid restaurant ID format" });
    }
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant by ID:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// READ Single Restaurant by Email
const getRestaurantByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Invalid email format" });
    }
    const restaurant = await Restaurant.findOne({ email });
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant by email:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// READ Nearby Restaurants
const getNearbyRestaurants = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;

    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      isAvailable: true,
    });

    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching nearby restaurants:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// UPDATE Restaurant
const updateRestaurant = async (req, res) => {
  try {
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.address) updateData.address = req.body.address;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.cuisineType) updateData.cuisineType = req.body.cuisineType;
    if (req.body.location) {
      updateData.location = {
        type: "Point",
        coordinates: [parseFloat(req.body.location.longitude), parseFloat(req.body.location.latitude)],
      };
    }
    if (req.body.openingHours) {
      updateData.openingHours = JSON.parse(req.body.openingHours);
    }
    if (req.body.deliveryZones) {
      updateData.deliveryZones = req.body.deliveryZones.split(",").map((zone) => zone.trim());
    }
    if (req.file) updateData.imageUrl = `/uploads/${req.file.filename}`;
    if (req.body.isAvailable !== undefined) updateData.isAvailable = req.body.isAvailable === "true";

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update" });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    console.error("Error updating restaurant:", error.message);
    if (error.code === 11000 && error.keyPattern.email) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

// DELETE Restaurant
const deleteRestaurant = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid restaurant ID format" });
    }
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    console.error("Error deleting restaurant:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// CREATE MenuItem
const addMenuItem = async (req, res) => {
  try {
    const { restaurantId, name, price, description, category, isVegetarian, isVegan, isAvailable } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ error: "Invalid restaurantId format" });
    }

    const menuItem = new MenuItem({
      restaurantId,
      name,
      price: parseFloat(price),
      description: description || "",
      category: category || "Uncategorized",
      imageUrl,
      isVegetarian: isVegetarian === "true",
      isVegan: isVegan === "true",
      isAvailable: isAvailable === "true" || true,
    });

    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    console.error("Error adding menu item:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// READ Menu Items
const getMenuItems = async (req, res) => {
  try {
    const { restaurantId, category, vegetarian, vegan } = req.query;

    if (!restaurantId) {
      return res.status(400).json({ error: "restaurantId query parameter is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ error: "Invalid restaurantId format" });
    }

    const filter = { restaurantId: new mongoose.Types.ObjectId(restaurantId) };

    if (category) filter.category = category;
    if (vegetarian === "true") filter.isVegetarian = true;
    if (vegan === "true") filter.isVegan = true;

    const menuItems = await MenuItem.find(filter);
    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// READ Single Menu Item by ID
const getMenuItemById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid menu item ID format" });
    }
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json(menuItem);
  } catch (error) {
    console.error("Error fetching menu item:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// UPDATE Menu Item
const updateMenuItem = async (req, res) => {
  try {
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.price) updateData.price = parseFloat(req.body.price);
    if (req.body.category) updateData.category = req.body.category;
    if (req.body.isVegetarian !== undefined) updateData.isVegetarian = req.body.isVegetarian === "true";
    if (req.body.isVegan !== undefined) updateData.isVegan = req.body.isVegan === "true";
    if (req.body.isAvailable !== undefined) updateData.isAvailable = req.body.isAvailable === "true";
    if (req.file) updateData.imageUrl = `/uploads/${req.file.filename}`;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update" });
    }

    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json(menuItem);
  } catch (error) {
    console.error("Error updating menu item:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// DELETE Menu Item
const deleteMenuItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid menu item ID format" });
    }
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: "Menu item not found" });
    }
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ADD Review
const addReview = async (req, res) => {
  try {
    const { restaurantId, userId, rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ error: "Invalid restaurantId format" });
    }

    const review = new Review({
      restaurantId,
      userId,
      rating: parseFloat(rating),
      comment,
    });

    await review.save();

    await updateRestaurantRating(restaurantId);

    res.status(201).json(review);
  } catch (error) {
    console.error("Error adding review:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// GET Reviews for a restaurant
const getRestaurantReviews = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.restaurantId)) {
      return res.status(400).json({ error: "Invalid restaurantId format" });
    }
    const reviews = await Review.find({ restaurantId: req.params.restaurantId }).sort({
      createdAt: -1,
    });
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to update restaurant rating
const updateRestaurantRating = async (restaurantId) => {
  try {
    const result = await Review.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } },
    ]);

    if (result.length > 0) {
      await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: result[0].averageRating.toFixed(1),
      });
    }
  } catch (error) {
    console.error("Error updating restaurant rating:", error.message);
  }
};

module.exports = {
  addRestaurant,
  getRestaurants,
  getRestaurantById,
  getRestaurantByEmail,
  getNearbyRestaurants,
  updateRestaurant,
  deleteRestaurant,
  addMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  addReview,
  getRestaurantReviews,
};