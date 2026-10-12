const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const complaintSchema = new mongoose.Schema(
{
complaintType: {
type: String,
required: true,
trim: true,
},
description: {
type: String,
required: true,
trim: true,
},
status: {
type: String,
enum: ["OPEN", "IN_PROGRESS", "RESOLVED"],
default: "OPEN",
},
createdAt: {
type: Date,
default: Date.now,
},
resolvedAt: {
type: Date,
default: null,
},
}
);

const bookingSchema = new mongoose.Schema(
{
bookingCode: {
type: String,
unique: true,
index: true,
default: () => "HZY-" + randomUUID().slice(0, 8).toUpperCase(),
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

category: {
  type: String,
  default: "",
  trim: true,
},

bookingDate: {
  type: String,
  required: true,
},

bookingTime: {
  type: String,
  required: true,
},

price: {
  type: Number,
  required: true,
  min: 0,
},

customerLocation: {
  latitude: {
    type: Number,
    default: null,
  },
  longitude: {
    type: Number,
    default: null,
  },
  address: {
    type: String,
    default: "",
  },
},

status: {
  type: String,
  enum: [
    "REQUESTED",
    "ACCEPTED",
    "REJECTED",
    "COMPLETED",
    "CANCELLED",
  ],
  default: "REQUESTED",
},

paymentMethod: {
  type: String,
  enum: ["CASH", "RAZORPAY"],
  default: "CASH",
},

paymentStatus: {
  type: String,
  enum: ["PENDING", "PAID"],
  default: "PENDING",
},

complaint: {
  type: complaintSchema,
  default: null,
},


},
{
timestamps: true,
}
);

const { getModel } = require("../config/inMemoryDb");
const MongooseBooking = mongoose.model("Booking", bookingSchema);
module.exports = getModel("Booking", MongooseBooking);
