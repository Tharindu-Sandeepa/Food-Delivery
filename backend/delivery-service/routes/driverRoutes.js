const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

router.post('/', driverController.createDriver);
router.get('/', driverController.getAllDrivers);
router.get('/:id', driverController.getDriver);
router.put('/:id', driverController.updateDriver);
router.delete('/:id', driverController.deleteDriver);
router.get('/nearest/find', driverController.findNearestDriver);

module.exports = router;
