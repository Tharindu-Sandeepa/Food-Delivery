const express = require("express");
const router = express.Router();
const controller = require("../controllers/deliveryController");
const verifyToken = require("../middlewares/verifyToken");
const Delivery = require("../models/Delivery");
const Driver = require("../models/Driver");

router.post("/assign", controller.assignDriver);
router.patch("/:id/status", controller.updateStatus);
router.patch("/:id/complete", controller.completeDelivery);
router.get("/:id", controller.getDelivery);
router.get("/driver/:id", controller.getDeliveryByDriverId);
router.get("/order/:id", controller.getDeliveryByOrderId);
router.get("/", controller.getAllDeliveries); 



// Get delivery route
router.get('/:deliveryId/route', async (req, res) => {
    try {
      const delivery = await Delivery.findOne({ deliveryId: req.params.deliveryId });
      
      if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found' });
      }
  
      // Get route from OpenRouteService (same as in your frontend)
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
  });
  
  // Get current driver position
  router.get('/:deliveryId/position', async (req, res) => {
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
  });
  



module.exports = router;
