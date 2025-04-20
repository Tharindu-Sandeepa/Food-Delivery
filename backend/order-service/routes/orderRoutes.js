const express = require("express");
const router = express.Router();
const controller = require("../controllers/orderController");

router.post("/", controller.createOrder);
router.get("/:id", controller.getOrderById);
router.get("/", controller.getAllOrders); // optional
router.patch("/:id/status", controller.updateOrderStatus);

module.exports = router;
