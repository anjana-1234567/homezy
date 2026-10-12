
const express = require("express");

const {
  createReview,
  getCustomerReviews,
  getAllReviews,
  getProviderReviews,
} = require("../controllers/reviewController");

const router = express.Router();

router.post("/", createReview);
router.get("/admin", getAllReviews);
router.get("/customer/:customerId", getCustomerReviews);
router.get("/provider/:providerId", getProviderReviews);

module.exports = router;
