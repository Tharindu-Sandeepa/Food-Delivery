const express = require('express');
const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3005;
const authRoutes = require("./routes/authRoutes");

app.use(express.json());
app.use(cors());
app.use("/api/v1/auth", authRoutes);

// MongoDB Connection
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});