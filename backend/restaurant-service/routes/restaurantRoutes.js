const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// MenuItem Routes
router.post('/menu', upload.single('image'), restaurantController.addMenuItem);
router.get('/menu', restaurantController.getMenuItems);
router.get('/menu/:id', restaurantController.getMenuItemById);
router.put('/menu/:id', upload.single('image'), restaurantController.updateMenuItem);
router.delete('/menu/:id', restaurantController.deleteMenuItem);

// Restaurant Routes
router.post('/', restaurantController.addRestaurant);
router.get('/', restaurantController.getRestaurants);
router.get('/nearby', restaurantController.getNearbyRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.put('/:id', restaurantController.updateRestaurant);
router.delete('/:id', restaurantController.deleteRestaurant);

// Review Routes
router.post('/:restaurantId/reviews', restaurantController.addReview);
router.get('/:restaurantId/reviews', restaurantController.getRestaurantReviews);

module.exports = router;