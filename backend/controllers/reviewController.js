const Review = require("../models/Review");
const Booking = require("../models/Booking");
// Customer submits a review
 const createReview = async (req, res) => {
  try {
    const { bookingId, customerId, rating, comment } = req.body;

    if (!bookingId || !customerId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Booking, customer and rating are required.",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    // Ensure this customer owns the booking.
    // Adjust customerId below if your Booking model uses another field.
    if (String(booking.customerId) !== String(customerId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot review this booking.",
      });
    }

    if (String(booking.status).toUpperCase() !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "You can review only completed bookings.",
      });
    }

    const existingReview = await Review.findOne({
      booking: bookingId,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this booking.",
      });
    }

    const review = await Review.create({
      booking: booking._id,
      customer: customerId,
      provider: booking.providerId,
      service: booking.service,
      rating: numericRating,
      comment: String(comment || "").trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This booking has already been reviewed.",
      });
    }

    console.error("Create review error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit review.",
    });
  }
};

// Get reviews submitted by one customer
 const getCustomerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      customer: req.params.customerId,
    })
      .populate("customer", "name email")
      .populate("provider", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Get customer reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch customer reviews.",
    });
  }
};

// Admin gets all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("customer", "name email")
      .populate("provider", "name email")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating = totalReviews
      ? Number(
          (
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews
          ).toFixed(1)
        )
      : 0;

    return res.json({
      success: true,
      totalReviews,
      averageRating,
      reviews,
    });
  } catch (error) {
    console.error("Get all reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch reviews.",
    });
  }
};

// Get reviews for one provider with average rating
const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    const reviews = await Review.find({ provider: providerId })
      .populate("customer", "name email")
      .populate("provider", "name email")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const averageRating = totalReviews
      ? Number(
          (
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews
          ).toFixed(1)
        )
      : 0;

    return res.status(200).json({
      success: true,
      providerId,
      totalReviews,
      averageRating,
      reviews,
    });
  } catch (error) {
    console.error("Get provider reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch provider reviews.",
    });
  }
};
module.exports = {
  createReview,
  getCustomerReviews,
  getAllReviews,
  getProviderReviews,
};