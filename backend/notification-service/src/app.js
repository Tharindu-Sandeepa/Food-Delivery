const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Route files
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v1/notifications', notificationRoutes);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3006;

const server = app.listen(
  PORT,
  console.log(`Notification Service running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});