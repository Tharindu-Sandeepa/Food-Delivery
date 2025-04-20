const express = require("express");
const router = express.Router();
const controller = require("../controllers/deliveryController");
const verifyToken = require("../middlewares/verifyToken");

router.post("/assign", verifyToken, controller.assignDelivery);
router.patch("/:id/status", controller.updateStatus);
router.post("/:id/complete", controller.completeDelivery);
router.get("/:id", controller.getDelivery);
router.get("/driver/:id", controller.getDeliveryByDriverId);
router.get("/order/:id", controller.getDeliveryByOrderId);
router.get("/", controller.getAllDeliveries); 

module.exports = router;
