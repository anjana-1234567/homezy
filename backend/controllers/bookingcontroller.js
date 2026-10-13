const Booking = require("../models/Booking");
const User = require("../models/User");

// ======================================================
// CREATE BOOKING
// ======================================================

const createBooking = async (req, res) => {
  try {
    const {
      customerId,
      providerId,
      service,
      category,
      bookingDate,
      bookingTime,
      price,
      customerLocation,
      paymentMethod,
    } = req.body;

    if (
      !customerId ||
      !providerId ||
      !service ||
      !bookingDate ||
      !bookingTime ||
      price === undefined ||
      price === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer, provider, service, date, time and price are required",
      });
    }

    const customer = await User.findById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (customer.role !== "customer") {
      return res.status(400).json({
        success: false,
        message: "Invalid customer",
      });
    }

    const provider = await User.findById(providerId);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    if (provider.role !== "provider") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a provider",
      });
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price",
      });
    }

    const selectedPaymentMethod =
      paymentMethod === "RAZORPAY"
        ? "RAZORPAY"
        : "CASH";

    // Deduplication: prevent creating duplicate bookings for the same slot
    const existingPendingBooking = await Booking.findOne({
      customerId: customer._id,
      providerId: provider._id,
      service: service.trim(),
      bookingDate: bookingDate.trim(),
      bookingTime: bookingTime.trim(),
      status: "REQUESTED",
    }).sort({ createdAt: -1 });

    if (existingPendingBooking) {
      existingPendingBooking.paymentMethod = selectedPaymentMethod;
      existingPendingBooking.price = numericPrice;
      if (customerLocation?.latitude && customerLocation?.longitude) {
        existingPendingBooking.customerLocation = {
          latitude: Number(customerLocation.latitude),
          longitude: Number(customerLocation.longitude),
          address: customerLocation.address || existingPendingBooking.customerLocation?.address || "",
        };
      }
      await existingPendingBooking.save();

      return res.status(200).json({
        success: true,
        message: "Booking request updated",
        booking: existingPendingBooking,
      });
    }

    const booking = await Booking.create({
      customerId: customer._id,

      providerId: provider._id,

      service: service.trim(),

      category: category
        ? category.trim()
        : "",

      bookingDate: bookingDate.trim(),

      bookingTime: bookingTime.trim(),

      price: numericPrice,

      customerLocation: {
        latitude:
          customerLocation?.latitude !== undefined &&
          customerLocation?.latitude !== null
            ? Number(customerLocation.latitude)
            : null,

        longitude:
          customerLocation?.longitude !== undefined &&
          customerLocation?.longitude !== null
            ? Number(customerLocation.longitude)
            : null,

        address:
          customerLocation?.address
            ? customerLocation.address.trim()
            : "",
      },

      status: "REQUESTED",

      paymentMethod: selectedPaymentMethod,

      paymentStatus: "PENDING",

      complaint: null,
    });

    // ==================================================
    // PROVIDER NOTIFICATION
    // ==================================================

    try {
      await User.findByIdAndUpdate(
        provider._id,
        {
          $push: {
            notifications: {
              message: `New booking request for ${booking.service}`,

              type: "BOOKING_REQUEST",

              bookingId: booking._id,

              read: false,

              createdAt: new Date(),
            },
          },
        },
        {
          new: true,
        }
      );
    } catch (notificationError) {
      console.error(
        "Provider notification error:",
        notificationError
      );
    }

    return res.status(201).json({
      success: true,

      message:
        "Booking request sent to provider",

      booking,
    });
  } catch (error) {
    console.error(
      "Create booking error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while creating booking",
    });
  }
};

// ======================================================
// GET CUSTOMER BOOKINGS
// ======================================================

const getCustomerBookings = async (
  req,
  res
) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({
        success: false,

        message:
          "Customer ID is required",
      });
    }

    const bookings =
      await Booking.find({
        customerId,
      })
        .populate(
          "providerId",
          "name email phone address location experience serviceCategories"
        )
        .sort({
          createdAt: -1,
        });

    const customer =
      await User.findById(
        customerId
      ).select("notifications");

    return res.status(200).json({
      success: true,

      bookings,

      notifications:
        customer?.notifications || [],
    });
  } catch (error) {
    console.error(
      "Get customer bookings error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while fetching customer bookings",
    });
  }
};

// ======================================================
// GET PROVIDER BOOKING REQUESTS
// ======================================================

const getProviderRequests = async (
  req,
  res
) => {
  try {
    const { providerId } = req.params;

    if (!providerId) {
      return res.status(400).json({
        success: false,

        message:
          "Provider ID is required",
      });
    }

    const requests =
      await Booking.find({
        providerId,

        status: {
          $in: [
            "REQUESTED",
            "ACCEPTED",
            "COMPLETED",
            "REJECTED",
          ],
        },
      })
        .populate(
          "customerId",
          "name email phone address location"
        )
        .sort({
          createdAt: -1,
        });

    const newRequests =
      await Booking.countDocuments({
        providerId,

        status: "REQUESTED",
      });

    const acceptedCount =
      await Booking.countDocuments({
        providerId,

        status: {
          $in: [
            "ACCEPTED",
            "COMPLETED",
          ],
        },
      });

    const rejected =
      await Booking.countDocuments({
        providerId,

        status: "REJECTED",
      });

    const completed =
      await Booking.countDocuments({
        providerId,

        status: "COMPLETED",
      });

    return res.status(200).json({
      success: true,

      requests,

      counts: {
        newRequests,

        accepted: acceptedCount,

        rejected,

        completed,
      },
    });
  } catch (error) {
    console.error(
      "Get provider requests error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while fetching booking requests",
    });
  }
};

// ======================================================
// GET PROVIDER JOBS
// ======================================================

const getProviderJobs = async (
  req,
  res
) => {
  try {
    const { providerId } = req.params;

    if (!providerId) {
      return res.status(400).json({
        success: false,

        message:
          "Provider ID is required",
      });
    }

    const jobs =
      await Booking.find({
        providerId,

        status: {
          $in: [
            "ACCEPTED",
            "COMPLETED",
          ],
        },
      })
        .populate(
          "customerId",
          "name email phone address location"
        )
        .sort({
          bookingDate: 1,

          createdAt: -1,
        });

    return res.status(200).json({
      success: true,

      jobs,
    });
  } catch (error) {
    console.error(
      "Get provider jobs error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while fetching provider jobs",
    });
  }
};

// ======================================================
// GET PROVIDER EARNINGS
// ======================================================

const getProviderEarnings = async (
  req,
  res
) => {
  try {
    const { providerId } = req.params;

    if (!providerId) {
      return res.status(400).json({
        success: false,

        message:
          "Provider ID is required",
      });
    }

    const completedJobs =
      await Booking.find({
        providerId,

        status: "COMPLETED",
      })
        .populate(
          "customerId",
          "name email phone address"
        )
        .sort({
          createdAt: -1,
        });

    const totalEarnings =
      completedJobs.reduce(
        (total, job) => {
          return (
            total +
            Number(job.price || 0)
          );
        },

        0
      );

    const completedJobsCount =
      completedJobs.length;

    return res.status(200).json({
      success: true,

      totalEarnings,

      completedJobsCount,

      jobs: completedJobs,
    });
  } catch (error) {
    console.error(
      "Get provider earnings error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while fetching provider earnings",
    });
  }
};

// ======================================================
// UPDATE BOOKING STATUS
// ======================================================

const updateBookingStatus = async (
  req,
  res
) => {
  try {
    const { bookingId } = req.params;

    const { status } = req.body;

    const allowedStatuses = [
      "ACCEPTED",
      "REJECTED",
      "COMPLETED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid booking status",
      });
    }

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {
      return res.status(404).json({
        success: false,

        message:
          "Booking not found",
      });
    }

    if (
      status === "ACCEPTED" &&
      booking.status !== "REQUESTED"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Only requested bookings can be accepted",
      });
    }

    if (
      status === "REJECTED" &&
      booking.status !== "REQUESTED"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Only requested bookings can be rejected",
      });
    }

    if (
      status === "COMPLETED" &&
      booking.status !== "ACCEPTED"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Only accepted bookings can be completed",
      });
    }

    if (
      status === "CANCELLED" &&
      ![
        "REQUESTED",
        "ACCEPTED",
      ].includes(booking.status)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "This booking cannot be cancelled",
      });
    }

    booking.status = status;

    if (
      status === "COMPLETED" &&
      booking.paymentMethod === "CASH"
    ) {
      booking.paymentStatus =
        "PENDING";
    }

    await booking.save();

    // ==================================================
    // CUSTOMER NOTIFICATION
    // ==================================================

    let notificationMessage = "";

    let notificationType = "";

    if (status === "ACCEPTED") {
      notificationMessage =
        `Your booking for ${booking.service} has been accepted by the provider.`;

      notificationType =
        "BOOKING_ACCEPTED";
    }

    if (status === "REJECTED") {
      notificationMessage =
        `Your booking request for ${booking.service} was rejected by the provider.`;

      notificationType =
        "BOOKING_REJECTED";
    }

    if (status === "COMPLETED") {
      notificationMessage =
        `Your booking for ${booking.service} has been completed.`;

      notificationType =
        "BOOKING_COMPLETED";
    }

    if (status === "CANCELLED") {
      notificationMessage =
        `Your booking for ${booking.service} has been cancelled.`;

      notificationType =
        "BOOKING_CANCELLED";
    }

    if (notificationMessage) {
      try {
        await User.findByIdAndUpdate(
          booking.customerId,

          {
            $push: {
              notifications: {
                message:
                  notificationMessage,

                type:
                  notificationType,

                bookingId:
                  booking._id,

                read: false,

                createdAt:
                  new Date(),
              },
            },
          },

          {
            new: true,
          }
        );
      } catch (
        notificationError
      ) {
        console.error(
          "Customer notification error:",
          notificationError
        );
      }
    }

    const updatedBooking =
      await Booking.findById(
        booking._id
      )
        .populate(
          "customerId",
          "name email phone address location"
        )
        .populate(
          "providerId",
          "name email phone address location experience serviceCategories"
        );

    return res.status(200).json({
      success: true,

      message:
        `Booking ${status.toLowerCase()} successfully`,

      booking:
        updatedBooking,
    });
  } catch (error) {
    console.error(
      "Update booking status error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while updating booking",
    });
  }
};

// ======================================================
// GET BOOKING BY ID
// ======================================================

const getBookingById = async (
  req,
  res
) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId) {
      return res.status(400).json({
        success: false,

        message:
          "Booking ID is required",
      });
    }

    const booking =
      await Booking.findById(
        bookingId
      )
        .populate(
          "customerId",
          "name email phone address location"
        )
        .populate(
          "providerId",
          "name email phone address location experience serviceCategories"
        );

    if (!booking) {
      return res.status(404).json({
        success: false,

        message:
          "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,

      booking,
    });
  } catch (error) {
    console.error(
      "Get booking error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while fetching booking",
    });
  }
};

// ======================================================
// RAISE COMPLAINT FOR BOOKING
// ======================================================

const createComplaint = async (
  req,
  res
) => {
  try {
    const {
      bookingId,
      customerId,
      complaintType,
      description,
    } = req.body;

    if (
      !bookingId ||
      !customerId ||
      !complaintType ||
      !description?.trim()
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Booking, customer, complaint type and description are required",
      });
    }

    // ==================================================
    // FIND BOOKING
    // ==================================================

    const booking =
      await Booking.findById(
        bookingId
      );

    if (!booking) {
      return res.status(404).json({
        success: false,

        message:
          "Booking not found",
      });
    }

    // ==================================================
    // MAKE SURE BOOKING BELONGS TO CUSTOMER
    // ==================================================

    if (
      booking.customerId.toString() !==
      customerId.toString()
    ) {
      return res.status(403).json({
        success: false,

        message:
          "You can only raise complaints for your own bookings",
      });
    }

    // ==================================================
    // REJECT INVALID BOOKING
    // ==================================================

    if (
      [
        "REJECTED",
        "CANCELLED",
      ].includes(booking.status)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "A complaint cannot be raised for this booking",
      });
    }

    // ==================================================
    // DUPLICATE COMPLAINT CHECK
    // ==================================================

    if (booking.complaint) {
      return res.status(400).json({
        success: false,

        message:
          "A complaint has already been raised for this booking",
      });
    }

    // ==================================================
    // CREATE COMPLAINT
    // ==================================================

    booking.complaint = {
      complaintType:
        complaintType.trim(),

      description:
        description.trim(),

      status: "OPEN",

      createdAt: new Date(),

      resolvedAt: null,
    };

    await booking.save();

    // ==================================================
    // RESPONSE
    // ==================================================

    const updatedBooking =
      await Booking.findById(
        booking._id
      )
        .populate(
          "providerId",
          "name email phone address location experience"
        );

    return res.status(201).json({
      success: true,

      message:
        "Complaint submitted successfully",

      booking:
        updatedBooking,
    });
  } catch (error) {
    console.error(
      "Create complaint error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while submitting complaint",
    });
  }
};

// ======================================================
// GET CUSTOMER COMPLAINTS
// ======================================================

const getCustomerComplaints = async (
  req,
  res
) => {
  try {
    const { customerId } =
      req.params;

    if (!customerId) {
      return res.status(400).json({
        success: false,

        message:
          "Customer ID is required",
      });
    }

    const bookings =
      await Booking.find({
        customerId,

        complaint: {
          $ne: null,
        },
      })
        .populate(
          "providerId",
          "name email phone"
        )
        .sort({
          "complaint.createdAt": -1,
        });

    return res.status(200).json({
      success: true,

      complaints:
        bookings,
    });
  } catch (error) {
    console.error(
      "Get customer complaints error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Server error while fetching complaints",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  createBooking,

  getCustomerBookings,

  getProviderRequests,

  getProviderJobs,

  getProviderEarnings,

  updateBookingStatus,

  getBookingById,

  createComplaint,

  getCustomerComplaints,
};