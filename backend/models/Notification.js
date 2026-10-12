const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    type: {
      type: String,
      enum: [
        "NEW_BOOKING",
        "BOOKING_ACCEPTED",
        "BOOKING_REJECTED",
        "BOOKING_COMPLETED",
        "BOOKING_CANCELLED",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const { getModel } = require("../config/inMemoryDb");
const MongooseNotification = mongoose.model("Notification", notificationSchema);
module.exports = getModel("Notification", MongooseNotification);