const User = require("../models/User");
const Booking = require("../models/Booking");
const Complaint = require("../models/Complaint1");

// ADMIN DASHBOARD STATS
const getAdminStats = async (req, res) => {
try {
const [
totalCustomers,
totalProviders,
totalBookings,
pendingComplaints,
completedBookings,
] = await Promise.all([
User.countDocuments({ role: "customer" }),
User.countDocuments({ role: "provider" }),
Booking.countDocuments(),
Complaint.countDocuments({ status: "IN REVIEW" }),
Booking.countDocuments({ status: "COMPLETED" }),
]);


return res.status(200).json({
  success: true,
  stats: {
    totalCustomers,
    totalProviders,
    totalBookings,
    pendingComplaints,
    completedBookings,
  },
});


} catch (error) {
console.error("Get admin stats error:", error);
return res.status(500).json({
success: false,
message: "Failed to fetch admin statistics",
error: error.message,
});
}
};

// GET ALL CUSTOMERS
const getAllCustomers = async (req, res) => {
try {
const customers = await User.find({ role: "customer" })
.select("-password")
.sort({ createdAt: -1 });


return res.status(200).json({
  success: true,
  customers,
});


} catch (error) {
console.error("Get customers error:", error);
return res.status(500).json({
success: false,
message: "Failed to fetch customers",
error: error.message,
});
}
};
const getAllProviders = async (req, res) => {
  try {
    console.log("User model type:", typeof User.find);
    
    const providers = await User.find({ role: "provider" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      providers,
    });
  } catch (error) {
    console.error("Get providers error:", error.stack || error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch providers",
      error: error.message,
    });
  }
};

// GET ALL BOOKINGS
const getAllBookings = async (req, res) => {
try {
const bookings = await Booking.find()
.populate("customerId", "name email phone")
.populate("providerId", "name email phone")
.sort({ createdAt: -1 });


return res.status(200).json({
  success: true,
  bookings,
});


} catch (error) {
console.error("Get bookings error:", error);
return res.status(500).json({
success: false,
message: "Failed to fetch bookings",
error: error.message,
});
}
};

// GET ALL COMPLAINTS
const getAllComplaints = async (req, res) => {
try {
const bookings = await Booking.find({
complaint: { $ne: null },
})
.populate("customerId", "name email phone")
.populate("providerId", "name email phone")
.sort({ "complaint.createdAt": -1 });


const complaints = bookings.map((booking) => ({
  _id: booking._id,
  bookingId: booking._id,
  bookingCode: booking.bookingCode,
  customerId: booking.customerId,
  providerId: booking.providerId,
  service: booking.service,
  bookingDate: booking.bookingDate,
  bookingTime: booking.bookingTime,
  price: booking.price,
  bookingStatus: booking.status,
  complaintType: booking.complaint.complaintType,
  description: booking.complaint.description,
  status: booking.complaint.status,
  createdAt: booking.complaint.createdAt,
  resolvedAt: booking.complaint.resolvedAt,
}));

return res.status(200).json({
  success: true,
  complaints,
});


} catch (error) {
console.error("Get complaints error:", error);


return res.status(500).json({
  success: false,
  message: "Failed to fetch complaints",
  error: error.message,
});

}
};


// UPDATE COMPLAINT STATUS
const updateComplaintStatus = async (req, res) => {
try {
const { id } = req.params;
const { status } = req.body;


const allowedStatuses = ["IN REVIEW", "RESOLVED", "REJECTED"];

if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid complaint ID",
  });
}

if (!allowedStatuses.includes(status)) {
  return res.status(400).json({
    success: false,
    message: "Invalid complaint status",
  });
}

const complaint = await Complaint.findByIdAndUpdate(
  id,
  { $set: { status } },
  { new: true, runValidators: true }
);

if (!complaint) {
  return res.status(404).json({
    success: false,
    message: "Complaint not found",
  });
}

return res.status(200).json({
  success: true,
  message: "Complaint status updated successfully",
  complaint,
});


} catch (error) {
console.error("Update complaint status error:", error);
return res.status(500).json({
success: false,
message: "Failed to update complaint status",
error: error.message,
});
}
};

// ADMIN ANALYTICS
const getAnalytics = async (req, res) => {
try {
const [
totalCustomers,
totalProviders,
totalBookings,
completedBookings,
requestedBookings,
acceptedBookings,
rejectedBookings,
cancelledBookings,
pendingComplaints,
resolvedComplaints,
bookingStatus,
] = await Promise.all([
User.countDocuments({ role: "customer" }),
User.countDocuments({ role: "provider" }),
Booking.countDocuments(),
Booking.countDocuments({ status: "COMPLETED" }),
Booking.countDocuments({ status: "REQUESTED" }),
Booking.countDocuments({ status: "ACCEPTED" }),
Booking.countDocuments({ status: "REJECTED" }),
Booking.countDocuments({ status: "CANCELLED" }),
Complaint.countDocuments({ status: "IN REVIEW" }),
Complaint.countDocuments({ status: "RESOLVED" }),
Booking.aggregate([
{
$group: {
_id: "$status",
count: { $sum: 1 },
},
},
{
$sort: { _id: 1 },
},
]),
]);


return res.status(200).json({
  success: true,
  analytics: {
    totalCustomers,
    totalProviders,
    totalBookings,
    completedBookings,
    requestedBookings,
    acceptedBookings,
    rejectedBookings,
    cancelledBookings,
    pendingComplaints,
    resolvedComplaints,
    bookingStatus,
  },
});


} catch (error) {
console.error("Get analytics error:", error);
return res.status(500).json({
success: false,
message: "Failed to fetch analytics",
error: error.message,
});
}
};

// EXPORT FUNCTIONS
module.exports = {
getAdminStats,
getAllCustomers,
getAllProviders,
getAllBookings,
getAllComplaints,
updateComplaintStatus,
getAnalytics,
};
