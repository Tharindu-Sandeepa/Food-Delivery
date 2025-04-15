const express = require("express");
const mongoose = require("mongoose");
const deliveryRoutes = require("./routes/deliveryRoutes");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

const app = express();
const server = http.createServer(app); // Create HTTP server manually
const io = new Server(server, {
  cors: {
    origin: "*", // allow all for dev, restrict in prod
  },
});
const cors = require("cors");

app.use(cors());
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Routes
app.use("/api/deliveries", deliveryRoutes);

// WebSocket logic
io.on("connection", (socket) => {
  console.log("New client connected: ", socket.id);

  // Listen for location updates
  socket.on("delivery-location-update", (data) => {
    console.log("Location update:", data);

    // Broadcast to all clients (or use a room for specific delivery ID)
    io.emit("location-update", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// MongoDB Connection
const mongoUri = process.env.MONGO_URI;
mongoose
  .connect(mongoUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`Delivery service with WebSocket running on port ${PORT}`);
});
