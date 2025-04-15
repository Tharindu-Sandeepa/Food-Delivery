const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// MongoDB Connection
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


app.listen(PORT, () => {
  console.log(`payment Service running on port ${PORT}`);
});