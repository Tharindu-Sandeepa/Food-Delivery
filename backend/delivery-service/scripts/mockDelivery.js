const io = require("socket.io-client");

const socket = io("http://localhost:3003", {
  reconnectionAttempts: 3,
  timeout: 5000,
});

socket.on("connect", () => {
  console.log("✅ Connected to server");

  let lat = 6.9036;
  let lng = 79.9545;

  setInterval(() => {
    lat += 0.0001;
    lng += 0.0001;

    socket.emit("delivery-location-update", {
      deliveryId: "abc123",
      driverId: "driver001",
      location: { lat, lng },
      status: "on_the_way",
      timestamp: new Date(),
    });

    console.log("📍 Emitted location:", lat, lng);
  }, 2000);
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection failed:", err.message);
});

socket.on("disconnect", () => {
  console.log("🔌 Disconnected from server");
});
