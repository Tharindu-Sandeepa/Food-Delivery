const Order = require("../models/Order");
const axios = require("axios");
const stripe = require("stripe")(
  "sk_test_51RIKxMFfm4N1s9LdAKbYqvagjsHQdVKE0R2xGIX5blXbpWzdhYTtMfD5tDtNMR5PRvZgmXalNWPd3A1abREucU5Z005lbi9sAy"
);

// Create new order
exports.createOrder = async (req, res) => {
  try {
    // Extract the entire order payload from the request body
    const orderPayload = req.body;

    // Validate payment for card orders
    if (
      orderPayload.paymentMethod === "card" &&
      !orderPayload.paymentMethodId
    ) {
      return res
        .status(400)
        .json({ message: "Payment method ID is required for card payments" });
    }

    // Save order to MongoDB
    const order = await Order.create(orderPayload);

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Process payment (new endpoint)
exports.processPayment = async (req, res) => {
  try {
    const { paymentMethodId, amount, currency } = req.body;

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method: paymentMethodId,
      confirm: true,
      return_url: "http://localhost:3000/checkout",
    });

    res.json({
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// Get order by Restaurant Id
exports.getOrderByRestaurantId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const order = await Order.find({ restaurantId: id });
    console.log("order", order);
    if (!order || order.length === 0)
      return res.status(404).json({ message: "Orders not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get order by Customer Id
exports.getOrderByCustomerId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const orders = await Order.find({ customerId: id });
    console.log("orders", orders);
    if (!orders || orders.length === 0)
      return res.status(404).json({ message: "Orders not found" });
    res.json(orders);
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
    const { deliveryId, status } = req.body;
    console.log(
      "Updating order status for deliveryId:",
      deliveryId,
      "to status:",
      status
    );
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
      { status: "ready" }
    );
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    console.log("Order marked as ready:", order);

    let response = {};
    try {
      // Notify Delivery Service
      const deliveryResponse = await axios.post(
        "http://localhost:3003/api/deliveries/assign",
        {
          orderId: order.orderId,
          deliveryFee: order.deliveryFee,
          restaurantId: order.restaurantId,
          deliveryAddress: order.deliveryAddress,
          startLocation: order.restaurantLocation,
        }
      );
      console.log("Delivery Service response>>>>:", deliveryResponse.data);
      response = deliveryResponse.data;
    } catch (axiosError) {
      console.error("Error notifying Delivery Service:", axiosError.message);
      return res
        .status(500)
        .json({ error: "Failed to notify Delivery Service" });
    }

    res.json(response);
  } catch (error) {
    console.error("Error marking order as ready:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.receiveDriverAssignment = async (req, res) => {
  try {
    const { orderId, deliveryId, driverId, driverName, contactNumber } =
      req.body;
    const result = await Order.updateOne(
      { orderId },
      {
        status: "assigned",
        deliveryPersonId: driverId,
        deliveryId: deliveryId,
        deliveryPersonName: driverName,
        contactNumber: contactNumber,
      }
    );

    if (result.nModified === 0) {
      return res
        .status(404)
        .json({ error: "Order not found or already updated" });
    }

    res.json({ message: "Driver assignment received and order updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

