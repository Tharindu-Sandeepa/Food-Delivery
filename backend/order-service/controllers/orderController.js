const Order = require('../models/Order');
const axios = require('axios');
const mongoose = require('mongoose');

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const order = await Order.findOne({ orderId: id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order by Restaurant Id ID
exports.getOrderByRestaurantId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const order = await Order.find({ restaurantId: id });

    console.log("order", order);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all orders (optional)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { orderId: id },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatusByDeliveryId = async (req, res) => {
  try {

    const { deliveryId } = req.body;
    const { status } = req.body;

    console.log("Updating order status for deliveryId:", deliveryId, "to status:", status);
    const order = await Order.findOneAndUpdate(
      { deliveryId },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.markOrderReady = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      { status: 'ready' },
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    console.log("Order marked as ready:", order);

    let response = {};

    try {
      // Directly notify the Delivery Service
      const deliveryResponse = await axios.post('http://localhost:3003/api/deliveries/assign', {
        orderId: order.orderId,
        deliveryFee: order.deliveryFee,
        restaurantId: order.restaurantId,
        deliveryAddress: order.deliveryAddress,
        startLocation: order.restaurantLocation
      });
      console.log("Delivery Service response>>>>:", deliveryResponse.data);
      response = deliveryResponse.data; // Assign the response data to the outer variable
    } catch (axiosError) {
      console.error("Error notifying Delivery Service:", axiosError.message);
      return res.status(500).json({ error: "Failed to notify Delivery Service" });
    }
    
    res.json(response);
  } catch (error) {
    console.error("Error marking order as ready:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// routes/orders.js or controllers/orderController.js
exports.receiveDriverAssignment = async (req, res) => {
  try {
    const { orderId, deliveryId, driverId, driverName, contactNumber } = req.body;

    const result = await Order.updateOne(
      { orderId },
      {
        status: 'assigned',
        deliveryPersonId: driverId,
        deliveryId: deliveryId,
        deliveryPersonName: driverName,
        contactNumber: contactNumber
      }
    );

    if (result.nModified === 0) {
      return res.status(404).json({ error: "Order not found or already updated" });
    }

    res.json({ message: "Driver assignment received and order updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
