const express = require("express");
const router = express.Router();

const {
getAdminStats,
getAllCustomers,
getAllProviders,
getAllBookings,
getAllComplaints,
getAnalytics,
updateComplaintStatus,
} = require("../controllers/adminController");

// ADMIN ROUTES
router.get("/stats", getAdminStats);
router.get("/customers", getAllCustomers);
router.get("/providers", getAllProviders);
router.get("/bookings", getAllBookings);
router.get("/complaints", getAllComplaints);
router.get("/analytics", getAnalytics);

// UPDATE COMPLAINT STATUS
router.patch("/complaints/:id", updateComplaintStatus);

module.exports = router;
