const express = require('express');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = 3010;

app.use(express.json());

// ORDER_SERVICE_URL: http://order-service:3001
//   RESTAURANT_SERVICE_URL: http://restaurant-service:3002
//   DELIVERY_SERVICE_URL: http://delivery-service:3003
//   PAYMENT_SERVICE_URL: http://payment-service:3004
//   USER_SERVICE_URL: http://user-service:3005
//   NOTIFICATION_SERVICE_URL: http://notification-service:3006

const orderServiceUrl = process.env.ORDER_SERVICE_URL;
const deliveryServiceUrl = process.env.DELIVERY_SERVICE_URL;
const paymentServiceUrl = process.env.PAYMENT_SERVICE_URL;
const restaurantServiceUrl = process.env.RESTAURANT_SERVICE_URL;
const userServiceUrl = process.env.USER_SERVICE_URL;
const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL;


// Proxy ANY request under /api/delivery/* to your delivery-service
app.use(
  '/api/deliveries',
  createProxyMiddleware({
    target: deliveryServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/delivery': '',   // strip the /api/delivery prefix if needed
    },
  })
);

// Proxy ANY request under /api/payment/* to your payment-service
app.use(
  '/api/payment',
  createProxyMiddleware({
    target: paymentServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/payment': '',   // strip the /api/payment prefix if needed
    },
  })
);

// Proxy ANY request under /api/user/* to your user-service
app.use(
  '/api/v1/users',
  createProxyMiddleware({
    target: userServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/users': '',   // strip the /api/user prefix if needed
    },
  })
);

// Proxy ANY request under /api/notification/* to your notification-service
app.use(
  '/api/notification',
  createProxyMiddleware({
    target: notificationServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/notification': '',   // strip the /api/notification prefix if needed
    },
  })
);



// Proxy ANY request under /api/orders/* to your order-service
app.use(
  '/api/orders',
  createProxyMiddleware({
    target: orderServiceUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/api/orders': '',
    },
  })
);

// Likewise for restaurants (or any other service)
app.use(
  '/api/restaurants',
  createProxyMiddleware({
    target: restaurantServiceUrl,
    changeOrigin: true,
    pathRewrite: { '^/api/restaurants': '' },
  })
);

// A quick health check
app.get('/test', (req, res) => res.json({ message: 'Gateway OK' }));

app.listen(process.env.PORT || 3010, () =>
  console.log(`Gateway listening on port ${process.env.PORT || 3010}`)
);