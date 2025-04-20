const express = require("express");
const router = express.Router();
const controller = require("../controllers/orderController");

router.patch('/:orderId/ready', controller.markOrderReady)
router.post("/driver-assigned", controller.receiveDriverAssignment);
router.patch("/delivery-complete", controller.updateOrderStatusByDeliveryId);
router.post("/", controller.createOrder);
router.get("/:id", controller.getOrderById);
router.get("/restaurant/:id", controller.getOrderByRestaurantId);
router.get("/", controller.getAllOrders); // optional
router.patch("/:id/status", controller.updateOrderStatus);

module.exports = router;
