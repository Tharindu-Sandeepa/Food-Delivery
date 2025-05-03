const express = require('express');
const {
  sendOrderNotification,
  sendDeliveryNotification,
} = require('../controllers/notificationController');

const router = express.Router();

// Notification routes
router.post('/order', sendOrderNotification);
router.post('/delivery', sendDeliveryNotification);

module.exports = router;