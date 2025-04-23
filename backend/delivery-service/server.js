const express = require("express");
const mongoose = require("mongoose");
const deliveryRoutes = require("./routes/deliveryRoutes");
const driverRoutes = require('./routes/driverRoutes');
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const Driver = require("./models/Driver");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3003;

// Routes
app.use("/api/deliveries", deliveryRoutes);
app.use('/api/drivers', driverRoutes);

// MongoDB Connection
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// WebSocket Tracking
const deliverySubscriptions = new Map();
const connectedClients = new Map();

// Debugging function
function debugConnections() {
  console.log('\n=== CURRENT CONNECTIONS ===');
  console.log(`Total clients: ${connectedClients.size}`);
  console.log(`Delivery subscriptions: ${deliverySubscriptions.size}`);
  deliverySubscriptions.forEach((subscribers, deliveryId) => {
    console.log(`Delivery ${deliveryId} has ${subscribers.size} subscribers`);
  });
  console.log('=========================\n');
}

io.on("connection", (socket) => {
  console.log(`[CONNECT] New client connected: ${socket.id}`);
  connectedClients.set(socket.id, socket);
  debugConnections();

  socket.on("driver_register", (data) => {
    console.log(`[DRIVER REGISTER] Driver ${data.driverId} registered from ${socket.id}`);
    Driver.updateOne(
      { userId: data.driverId },
      { 
        location: {
          type: 'Point',
          coordinates: [data.position.lng, data.position.lat]
        }
      }
    ).exec().then(() => {
      console.log(`[DB] Updated driver ${data.driverId} location`);
    });
  });

  socket.on("customer_subscribe", (data) => {
    console.log(`[SUBSCRIBE] Customer ${data.customerId} subscribed to delivery ${data.deliveryId}`);
    if (!deliverySubscriptions.has(data.deliveryId)) {
      deliverySubscriptions.set(data.deliveryId, new Set());
    }
    deliverySubscriptions.get(data.deliveryId).add(socket.id);
    debugConnections();
  });

  socket.on("position_update", (data) => {
    console.log(`[POSITION UPDATE] From driver ${data.driverId} for delivery ${data.deliveryId}`);
    console.log(`Position: ${JSON.stringify(data.position)}`);
    console.log(`Progress: ${data.progress}%`);

    Driver.updateOne(
      { userId: data.driverId },
      { 
        location: {
          type: 'Point',
          coordinates: [data.position.lng, data.position.lat]
        }
      }
    ).exec();

    if (deliverySubscriptions.has(data.deliveryId)) {
      const subscribers = deliverySubscriptions.get(data.deliveryId);
      console.log(`[BROADCAST] Sending to ${subscribers.size} subscribers`);
      
      subscribers.forEach(socketId => {
        const clientSocket = connectedClients.get(socketId);
        if (clientSocket && clientSocket.connected) {
          console.log(`[SENDING] To client ${socketId}`);
          clientSocket.emit("position_update", {
            position: data.position,
            progress: data.progress,
            deliveryId: data.deliveryId
          });
        } else {
          console.log(`[WARNING] Client ${socketId} not connected, cleaning up`);
          subscribers.delete(socketId);
        }
      });
    } else {
      console.log(`[WARNING] No subscribers for delivery ${data.deliveryId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[DISCONNECT] Client ${socket.id} disconnected`);
    deliverySubscriptions.forEach((subscribers, deliveryId) => {
      if (subscribers.has(socket.id)) {
        subscribers.delete(socket.id);
        console.log(`[CLEANUP] Removed ${socket.id} from delivery ${deliveryId} subscribers`);
        if (subscribers.size === 0) {
          deliverySubscriptions.delete(deliveryId);
          console.log(`[CLEANUP] Removed empty delivery ${deliveryId} subscription`);
        }
      }
    });
    connectedClients.delete(socket.id);
    debugConnections();
  });

  // Ping/pong for connection health
  socket.on("ping", (cb) => {
    if (typeof cb === 'function') cb();
  });
});

// Debug connection status every minute
setInterval(debugConnections, 60000);

server.listen(PORT, () => {
  console.log(`Delivery service with WebSocket running on port ${PORT}`);
});