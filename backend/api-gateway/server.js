const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(express.json());

const orderServiceUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:3001';
const restaurantServiceUrl = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3002';

// Forward requests to Order Service
app.post('/api/orders', async (req, res) => {
  try {
    const response = await axios.post(`${orderServiceUrl}/orders`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Order Service Error' });
  }
});

// Forward requests to Restaurant Service
app.get('/api/restaurants', async (req, res) => {
  try {
    const response = await axios.get(`${restaurantServiceUrl}/restaurants`);
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Restaurant Service Error' });
  }
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});