const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const path = require("path");
dotenv.config();
dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./paymentRoutes");

const app = express();

// DATABASE
connectDB().catch((err) => {
  console.error("Database connection caught error:", err.message);
});

// CORS CONFIGURATION
const allowedOrigins = [
  "https://homezy-gold.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use("/api/reviews", reviewRoutes);

// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

// HEALTH & STATUS ROUTE
app.get("/api/health", async (req, res) => {
  let isConnected = mongoose.connection.readyState === 1;
  const rawUri = (process.env.MONGO_URI || "").trim().replace(/^["']|["']$/g, "").trim();
  const hasMongoUri = Boolean(rawUri);
  let connectionError = null;

  if (!isConnected && hasMongoUri) {
    try {
      await mongoose.connect(rawUri, {
        serverSelectionTimeoutMS: 8000,
      });
      isConnected = mongoose.connection.readyState === 1;
    } catch (err) {
      connectionError = err.message;
    }
  }

  const stateIndex = mongoose.connection.readyState;
  const states = ["disconnected", "connected", "connecting", "disconnecting"];

  let uriStructure = "NOT_CONFIGURED";
  if (hasMongoUri) {
    uriStructure = rawUri.replace(/mongodb(?:\+srv)?:\/\/([^:]+):([^@]+)@/, (match, user, pass) => {
      return `mongodb+srv://${user}:[HIDDEN_${pass.length}_CHARS]@`;
    });
  }

  res.status(200).json({
    success: true,
    status: isConnected ? "connected_to_atlas" : "healthy_with_resilience_fallback",
    database: {
      mode: isConnected ? "MongoDB Atlas Cloud" : "InMemory Resilience Store",
      connected: isConnected,
      hasMongoUri,
      uriStructure,
      error: connectionError,
      state: states[stateIndex] || "unknown",
      name: mongoose.connection.name || "in_memory",
    },
  });
});

// HOME ROUTE
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Homezy Backend is running!",
  });
});

// TEST ROUTES
app.get("/api/auth/test", (req, res) => {
res.status(200).json({
success: true,
message: "Auth routes are working!",
});
});

app.get("/api/location/test", (req, res) => {
res.status(200).json({
success: true,
message: "Location routes are working!",
});
});

app.get("/api/bookings/test", (req, res) => {
res.status(200).json({
success: true,
message: "Booking routes are working!",
});
});

app.get("/api/services/test", (req, res) => {
res.status(200).json({
success: true,
message: "Service routes are working!",
});
});

app.get("/api/complaints/test", (req, res) => {
res.status(200).json({
success: true,
message: "Complaint routes are working!",
});
});

app.get("/api/admin/test", (req, res) => {
res.status(200).json({
success: true,
message: "Admin routes are working!",
});
});

// 404 HANDLER
app.use((req, res) => {
res.status(404).json({
success: false,
message: "Route not found: " + req.method + " " + req.originalUrl,
});
});

// ERROR HANDLER
app.use((err, req, res, next) => {
console.error("Server Error:", err);

if (res.headersSent) {
return next(err);
}

res.status(500).json({
success: false,
message: "Internal server error",
});
});

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log("====================================");
console.log("Homezy Backend Started Successfully");
console.log("Server: http://localhost:" + PORT);
console.log("Auth: http://localhost:" + PORT + "/api/auth");
console.log("Location: http://localhost:" + PORT + "/api/location");
console.log("Bookings: http://localhost:" + PORT + "/api/bookings");
console.log("Services: http://localhost:" + PORT + "/api/services");
console.log("Complaints: http://localhost:" + PORT + "/api/complaints");
console.log("Admin: http://localhost:" + PORT + "/api/admin");
console.log("====================================");
});
