const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Review = require('../models/Review');
const mongoose = require('mongoose');

// CREATE Restaurant
const addRestaurant = async (req, res) => {
  try {
    const { name, address, location, cuisineType, openingHours, deliveryZones, imageUrl } = req.body;
    
    const restaurant = new Restaurant({
      name,
      address,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude]
      },
      cuisineType,
      openingHours,
      deliveryZones,
      imageUrl 
    });
    
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
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
    res.status(500).json({ error: error.message });
  }
};

// READ Single Restaurant by ID
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ Nearby Restaurants
const getNearbyRestaurants = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query; // maxDistance in meters
    
    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      isAvailable: true
    });
    
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE Restaurant
const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE Restaurant
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE MenuItem
const addMenuItem = async (req, res) => {
  try {
    const { restaurantId, name, price, description, category, isVegetarian, isVegan } = req.body;
    const imageUrl = req.file ? req.file.path : undefined;
    
    const menuItem = new MenuItem({
      restaurantId,
      name,
      price,
      description,
      category,
      imageUrl,
      isVegetarian,
      isVegan
    });
    
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ Menu Items
const getMenuItems = async (req, res) => {
  try {
    const { restaurantId, category, vegetarian, vegan } = req.query;
    const filter = { restaurantId};
    
    if (category) filter.category = category;
    if (vegetarian === 'true') filter.isVegetarian = true;
    if (vegan === 'true') filter.isVegan = true;
    
    const menuItems = await MenuItem.find(filter);
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ Single Menu Item by ID
const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE Menu Item
const updateMenuItem = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.imageUrl = req.file.path;
    }
    
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE Menu Item
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ADD Review
const addReview = async (req, res) => {
  try {
    const { restaurantId, userId, rating, comment } = req.body;
    
    const review = new Review({
      restaurantId,
      userId,
      rating,
      comment
    });
    
    await review.save();
    
    // Update restaurant average rating
    await updateRestaurantRating(restaurantId);
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET Reviews for a restaurant
const getRestaurantReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurantId: req.params.restaurantId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to update restaurant rating
const updateRestaurantRating = async (restaurantId) => {
  const result = await Review.aggregate([
    { $match: { restaurantId: mongoose.Types.ObjectId(restaurantId) } },
    { $group: { _id: null, averageRating: { $avg: "$rating" } } }
  ]);
  
  if (result.length > 0) {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: result[0].averageRating.toFixed(1)
    });
  }
};

module.exports = {
  addRestaurant,
  getRestaurants,
  getRestaurantById,
  getNearbyRestaurants,
  updateRestaurant,
  deleteRestaurant,
  addMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  addReview,
  getRestaurantReviews
};