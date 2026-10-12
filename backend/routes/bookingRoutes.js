const express = require("express");

const router = express.Router();

const {
  createBooking,
  getCustomerBookings,
  getProviderRequests,
  getProviderJobs,
  getProviderEarnings,
  updateBookingStatus,
  getBookingById,
} = require("../controllers/bookingcontroller");

// ======================================================
// TEST
// ======================================================

router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Booking routes are working!",
  });
});

// ======================================================
// CREATE BOOKING
// ======================================================

router.post("/", createBooking);

// ======================================================
// CUSTOMER BOOKINGS
// ======================================================

router.get(
  "/customer/:customerId",
  getCustomerBookings
);

// ======================================================
// PROVIDER BOOKING REQUESTS
// ======================================================

router.get(
  "/provider/:providerId/requests",
  getProviderRequests
);

// ======================================================
// PROVIDER JOBS
// ======================================================

router.get(
  "/provider/:providerId/jobs",
  getProviderJobs
);

// ======================================================
// PROVIDER EARNINGS
// ======================================================

router.get(
  "/provider/:providerId/earnings",
  getProviderEarnings
);

// ======================================================
// UPDATE BOOKING STATUS
// ======================================================

router.put(
  "/:bookingId/status",
  updateBookingStatus
);

// ======================================================
// GET SINGLE BOOKING
// ======================================================

router.get(
  "/:bookingId",
  getBookingById
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;