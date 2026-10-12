const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

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
connectDB();

// MIDDLEWARE
app.use(cors());
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
