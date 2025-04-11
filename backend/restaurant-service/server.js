const express = require('express');
const mongoose = require('mongoose');
const restaurantRoutes = require('./routes/restaurantRoutes');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/restaurants', restaurantRoutes);

app.listen(PORT, () => {
  console.log(`Restaurant Service running on port ${PORT}`);
});