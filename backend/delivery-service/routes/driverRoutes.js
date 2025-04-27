const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');


router.get('/:userId/checkIsRegistered', driverController.checkDriverExists);
router.post('/', driverController.registerDriver);
router.get('/:driverId/stats', driverController.getDriverStats);
router.get('/', driverController.getAllDrivers);
router.get('/:id', driverController.getDriver);
router.put('/:userId', driverController.updateDriver);
router.delete('/:id', driverController.deleteDriver);
router.get('/nearest/find', driverController.findNearestDriver);

// Get delivery route


// Get current driver position


// get driver stats
//router.get("/:driverId/stats", driverController.getDriverStats); 

// fetch only recent deliveries
router.get("/:userId/recent-deliveries", driverController.getRecentDeliveries);

router.get("/:userId/earnings-trend", driverController.getEarningsTrend);

router.get("/:userId/heatmap", driverController.getDeliveryHeatmap);

module.exports = router;
