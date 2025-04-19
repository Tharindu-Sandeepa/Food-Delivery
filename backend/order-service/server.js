const express = require('express');
const mongoose = require('mongoose');
const orderRoutes = require('./routes/orderRoutes');
const app = express();
const PORT = process.env.PORT || 3001;
const dotenv = require('dotenv');
dotenv.config();

app.use(express.json());
const cors = require("cors");
app.use(cors());

// MongoDB Connection
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/orders', orderRoutes);

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});