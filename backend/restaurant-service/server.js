require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const restaurantRoutes = require('./routes/restaurantRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors()); 
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/foodDelivery';
mongoose.connect(mongoUri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/restaurants', restaurantRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Restaurant Service running on port ${PORT}`);
});