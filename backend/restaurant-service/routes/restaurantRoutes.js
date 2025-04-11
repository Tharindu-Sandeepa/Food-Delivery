const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

// Restaurant Routes
router.post('/', restaurantController.addRestaurant);           // POST /restaurants
router.get('/', restaurantController.getRestaurants);           // GET /restaurants
router.get('/:id', restaurantController.getRestaurantById);     // GET /restaurants/:id
router.put('/:id', restaurantController.updateRestaurant);      // PUT /restaurants/:id
router.delete('/:id', restaurantController.deleteRestaurant);   // DELETE /restaurants/:id

// MenuItem Routes
router.post('/menu', restaurantController.addMenuItem);         // POST /restaurants/menu
router.get('/menu', restaurantController.getMenuItems);         // GET /restaurants/menu?restaurantId=...
router.get('/menu/:id', restaurantController.getMenuItemById);  // GET /restaurants/menu/:id
router.put('/menu/:id', restaurantController.updateMenuItem);   // PUT /restaurants/menu/:id
router.delete('/menu/:id', restaurantController.deleteMenuItem); // DELETE /restaurants/menu/:id

module.exports = router;