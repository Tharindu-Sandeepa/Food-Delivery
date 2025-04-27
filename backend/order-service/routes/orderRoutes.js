const express = require("express");
const router = express.Router();
const controller = require("../controllers/orderController");

router.patch("/:orderId/ready", controller.markOrderReady);
router.post("/driver-assigned", controller.receiveDriverAssignment);
router.patch("/delivery-complete", controller.updateOrderStatusByDeliveryId);
router.post("/", controller.createOrder);
router.post("/payments", controller.processPayment); // New endpoint for Stripe payments
router.get("/:id", controller.getOrderById);
router.get("/restaurant/:id", controller.getOrderByRestaurantId);
router.get("/", controller.getAllOrders);
router.patch("/:id/status", controller.updateOrderStatus);
router.get("/customer/:id", controller.getOrderByCustomerId);

module.exports = router;
