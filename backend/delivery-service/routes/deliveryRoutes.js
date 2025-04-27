const express = require("express");
const router = express.Router();
const controller = require("../controllers/deliveryController");
const verifyToken = require("../middlewares/verifyToken");

router.post("/assign", controller.assignDriver);
router.patch("/:id/status", controller.updateStatus);
router.patch("/:id/complete", controller.completeDelivery);
router.get("/:id", controller.getDelivery);
router.get("/driver/:id", controller.getDeliveryByDriverId);
router.get("/order/:id", controller.getDeliveryByOrderId);
router.get("/", controller.getAllDeliveries);



module.exports = router;
