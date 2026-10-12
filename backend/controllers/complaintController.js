const Complaint = require("../models/Complaint1");
const Booking = require("../models/Booking");
const User = require("../models/User");

// Customer creates a complaint
const createComplaint = async (req, res) => {
  try {
    const {
      bookingId,
      customerId,
      complaintType,
      description,
    } = req.body;

    if (!bookingId || !customerId || !complaintType || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide all complaint details.",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      customerId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found for this customer.",
      });
    }

    if (["CANCELLED", "REJECTED"].includes(
      String(booking.status || "").toUpperCase()
    )) {
      return res.status(400).json({
        success: false,
        message: "You cannot complain about this booking.",
      });
    }

    const existingComplaint = await Complaint.findOne({
      bookingId,
      customerId,
    });

    if (existingComplaint) {
      return res.status(409).json({
        success: false,
        message: "A complaint already exists for this booking.",
      });
    }

    const complaint = await Complaint.create({
      bookingId: booking._id,
      customerId,
      providerId: booking.providerId,
      service: booking.service,
      complaintType,
      description: description.trim(),
      status: "IN REVIEW",
    });

    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully.",
      complaint,
    });
  } catch (error) {
    console.error("Create complaint error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit complaint.",
    });
  }
};

// Get complaints for a customer
const getCustomerComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      customerId: req.params.customerId,
    })
      .populate("providerId", "name email phone")
      .populate("bookingId", "service bookingDate bookingTime price status")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("Get customer complaints error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer complaints.",
    });
  }
};

// Get all complaints for admin
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("customerId", "name email phone")
      .populate("providerId", "name email phone")
      .populate(
        "bookingId",
        "service bookingCode bookingDate bookingTime price status"
      )
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      complaints,
    });
  } catch (error) {
    console.error("Get all complaints error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaints.",
    });
  }
};

// Resolve a complaint
const resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(
      req.params.complaintId
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found.",
      });
    }

    if (complaint.status === "RESOLVED") {
      return res.json({
        success: true,
        message: "Complaint is already resolved.",
        complaint,
      });
    }

    complaint.status = "RESOLVED";
    await complaint.save();

    // Notify the customer, if notifications are supported by the User model
    try {
      const customer = await User.findById(complaint.customerId);

      if (customer && Array.isArray(customer.notifications)) {
        customer.notifications.push({
          message: `Your complaint about ${complaint.service} has been resolved.`,
          createdAt: new Date(),
          read: false,
        });

        await customer.save();
      }
    } catch (notificationError) {
      console.error(
        "Complaint notification could not be saved:",
        notificationError.message
      );
    }

    return res.json({
      success: true,
      message: "Complaint resolved successfully.",
      complaint,
    });
  } catch (error) {
    console.error("Resolve complaint error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resolve complaint.",
    });
  }
};

module.exports = {
  createComplaint,
  getCustomerComplaints,
  getAllComplaints,
  resolveComplaint,
};