const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    service: {
      type: String,
      required: true,
      trim: true,
    },

    complaintType: {
      type: String,
      enum: [
        "Service Quality",
        "Provider Late",
        "Provider Behaviour",
        "Payment Issue",
        "Booking Issue",
        "Incomplete Service",
        "Other",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "IN REVIEW",
        "RESOLVED",
        "REJECTED",
      ],
      default: "IN REVIEW",
    },
  },
  {
    timestamps: true,
  }
);

// One customer can raise only one complaint
// for the same booking
complaintSchema.index(
  {
    bookingId: 1,
    customerId: 1,
  },
  {
    unique: true,
  }
);

const { getModel } = require("../config/inMemoryDb");
const MongooseComplaint = mongoose.model("Complaint", complaintSchema);
module.exports = getModel("Complaint", MongooseComplaint);