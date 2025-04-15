const express = require("express");
const router = express.Router();
const controller = require("../controllers/deliveryController");

router.post("/assign", controller.assignDelivery);
router.patch("/:id/status", controller.updateStatus);
router.post("/:id/complete", controller.completeDelivery);
router.get("/:id", controller.getDelivery);
router.get("/", controller.getAllDeliveries); // optional

module.exports = router;
