const axios = require('axios');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const {
  sendOrderConfirmationEmail,
  sendDeliveryCompletionEmail,
  sendOrderDetailsToRestaurant,
} = require('../utils/email');

//     Send order confirmation notification
//    POST /api/v1/notifications/order
// 
exports.sendOrderNotification = asyncHandler(async (req, res, next) => {
  const { userId, orderId, items, total, restaurantName, restaurantId } = req.body;

  // Validate required fields
  if (!userId || !orderId || !items || !total || !restaurantName) {
    return next(new ErrorResponse('Missing required order details', 400));
  }

  // fetch restaurant details from resturentservice
  let restaurant;
  try {
    const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/v1/users/public/${restaurantId}`);
    restaurant = response.data.data;
  } catch (err) {
    console.error('Restaurant fetch error:', err.message);
    return next(new ErrorResponse(`Restaurant not found with id ${restaurantId}`, 404));
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

  // Send order confirmation email to customer
  await sendOrderConfirmationEmail(user.email, user.name, {
    orderId,
    items,
    total,
    restaurantName,
  });


//Send order confirmation email to restaurante
  await sendOrderDetailsToRestaurant(restaurant.email, {
    orderId,
    items,
    total,
    userName: user.name,
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

  console.log("Received delivery notification request:", req.body);

  // Validate required fields
  if (!userId || !orderId) {
    return next(new ErrorResponse('Missing required delivery details', 400));
  }

  // Fetch user from User Service
  let user;
  try {
    const response = await axios.get(`${process.env.USER_SERVICE_URL}/api/v1/users/public/${userId}`);
    console.log("User fetch response:", response.data);
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