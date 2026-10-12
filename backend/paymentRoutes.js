
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Booking = require("./models/Booking");

const router = express.Router();
console.log(
  "Key ID loaded:",
  !!process.env.RAZORPAY_KEY_ID
);

console.log(
  "Secret loaded:",
  !!process.env.RAZORPAY_KEY_SECRET
);

console.log(
  "Test mode:",
  process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_")
);

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "rzp_test_Tmjnygk2th7v2b";
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "5apL3kaR4sqZbwYbQMH1MUii";

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
} catch (err) {
  console.warn("Razorpay warning:", err.message);
}

// Create Razorpay order
router.post("/create-order", async (req, res) => {
  try {
    const { bookingId, customerId } = req.body;

    if (
      !mongoose.isValidObjectId(bookingId) ||
      !mongoose.isValidObjectId(customerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking or customer ID",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      customerId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.status === "CANCELLED" ||
      booking.status === "REJECTED"
    ) {
      return res.status(400).json({
        success: false,
        message: "This booking cannot be paid for",
      });
    }

    if (booking.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "This booking is already paid",
      });
    }

    const amountInPaise = Math.round(booking.price * 100);

    if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking amount",
      });
    }

    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      console.error("Razorpay credentials are missing");
      return res.status(500).json({
        success: false,
        message: "Razorpay credentials are not configured",
      });
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: booking.bookingCode,
      notes: {
        bookingId: booking._id.toString(),
      },
    });

    booking.paymentMethod = "RAZORPAY";
    await booking.save();

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", {
      message: error.message,
      statusCode: error.statusCode,
      description: error.error?.description,
      code: error.error?.code,
    });

    return res.status(500).json({
      success: false,
      message:
        error.error?.description ||
        error.message ||
        "Could not create payment order",
    });
  }
});

// Verify payment
router.post("/verify", async (req, res) => {
  try {
    const {
      bookingId,
      customerId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !mongoose.isValidObjectId(bookingId) ||
      !mongoose.isValidObjectId(customerId) ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid payment details",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      customerId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.paymentStatus === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Booking is already paid",
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      console.error("Razorpay secret is missing");
      return res.status(500).json({
        success: false,
        message: "Razorpay credentials are not configured",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const signatureBuffer = Buffer.from(razorpay_signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed",
      });
    }

    const order = await razorpay.orders.fetch(razorpay_order_id);

    if (
      order.id !== razorpay_order_id ||
      order.amount !== Math.round(booking.price * 100) ||
      order.currency !== "INR" ||
      order.notes?.bookingId !== booking._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment order does not match this booking",
      });
    }

    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (
      payment.order_id !== order.id ||
      payment.status !== "captured" ||
      payment.amount !== order.amount ||
      payment.currency !== order.currency
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment is not captured or does not match",
      });
    }

    booking.paymentMethod = "RAZORPAY";
    booking.paymentStatus = "PAID";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      booking,
    });
  } catch (error) {
    console.error("Verify payment error:", {
      message: error.message,
      statusCode: error.statusCode,
      description: error.error?.description,
      code: error.error?.code,
    });

    return res.status(500).json({
      success: false,
      message:
        error.error?.description ||
        error.message ||
        "Could not verify payment",
    });
  }
});

module.exports = router;
