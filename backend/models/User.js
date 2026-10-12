const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ========================================
    // BASIC USER DETAILS
    // ========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ========================================
    // USER ROLE
    // ========================================

    role: {
      type: String,
      enum: [
        "customer",
        "provider",
        "admin",
      ],
      default: "customer",
    },

    // ========================================
    // ACCOUNT STATUS
    // ========================================

    accountStatus: {
      type: String,
      enum: [
        "ACTIVE",
        "BLOCKED",
      ],
      default: "ACTIVE",
    },

    // ========================================
    // PROVIDER APPROVAL STATUS
    // ========================================

    approvalStatus: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
      ],
      default: function () {
        return this.role === "provider"
          ? "PENDING"
          : "APPROVED";
      },
    },

    // ========================================
    // ADDRESS
    // ========================================

    address: {
      type: String,
      trim: true,
      default: "",
    },

    // ========================================
    // PROVIDER SERVICE CATEGORIES
    // ========================================

    serviceCategories: {
      type: [String],
      default: [],
    },

    // ========================================
    // PROVIDER EXPERIENCE
    // ========================================

    experience: {
      type: String,
      trim: true,
      default: "",
    },

    // ========================================
    // ACCOUNT-WISE LOCATION
    // ========================================

    location: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },

      updatedAt: {
        type: Date,
        default: null,
      },
    },

    // ========================================
    // NOTIFICATIONS
    // ========================================

    notifications: [
      {
        message: {
          type: String,
          required: true,
        },

        type: {
          type: String,
          enum: [
            "BOOKING_REQUEST",
            "BOOKING_ACCEPTED",
            "BOOKING_REJECTED",
            "BOOKING_COMPLETED",
            "BOOKING_CANCELLED",
          ],
          default: "BOOKING_REQUEST",
        },

        bookingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Booking",
        },

        read: {
          type: Boolean,
          default: false,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);