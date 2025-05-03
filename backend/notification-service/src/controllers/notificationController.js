const axios = require('axios');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const {
  sendOrderConfirmationEmail,
  sendDeliveryCompletionEmail,
} = require('../utils/email');

//     Send order confirmation notification
//    POST /api/v1/notifications/order
// 
exports.sendOrderNotification = asyncHandler(async (req, res, next) => {
  const { userId, orderId, items, total, restaurantName } = req.body;

  // Validate required fields
  if (!userId || !orderId || !items || !total || !restaurantName) {
    return next(new ErrorResponse('Missing required order details', 400));
  }

  // Fetch user from User Service
  let user;
  try {
    const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/v1/users/public/${userId}`);
    user = response.data.data;
  } catch (err) {
    console.error('User fetch error:', err.message);
    return next(new ErrorResponse(`User not found with id ${userId}`, 404));
  }

  // Validate user data
  if (!user.email || !user.name) {
    return next(new ErrorResponse('User data missing required fields', 400));
  }

  // Send order confirmation email
  await sendOrderConfirmationEmail(user.email, user.name, {
    orderId,
    items,
    total,
    restaurantName,
  });

  res.status(200).json({
    success: true,
    message: 'Order confirmation email sent',
  });
});

//     Send delivery completion notification
//    POST /api/v1/notifications/delivery
// 
exports.sendDeliveryNotification = asyncHandler(async (req, res, next) => {
  const { userId, orderId } = req.body;

  // Validate required fields
  if (!userId || !orderId) {
    return next(new ErrorResponse('Missing required delivery details', 400));
  }

  // Fetch user from User Service
  let user;
  try {
    const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/v1/users/${userId}`);
    user = response.data.data;
  } catch (err) {
    console.error('User fetch error:', err.message);
    return next(new ErrorResponse(`User not found with id ${userId}`, 404));
  }

  // Validate user data
  if (!user.email || !user.name) {
    return next(new ErrorResponse('User data missing required fields', 400));
  }

  // Send delivery completion email
  await sendDeliveryCompletionEmail(user.email, user.name, orderId);

  res.status(200).json({
    success: true,
    message: 'Delivery completion email sent',
  });
});