const Notification = require("../models/Notification");

// ========================================
// GET USER NOTIFICATIONS
// ========================================

const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({
      recipientId: userId,
    })
      .populate(
        "bookingId",
        "service bookingDate bookingTime price status"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching notifications",
    });
  }
};

// ========================================
// MARK ONE NOTIFICATION AS READ
// ========================================

const markNotificationRead = async (
  req,
  res
) => {
  try {
    const { notificationId } = req.params;

    const notification =
      await Notification.findById(
        notificationId
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;

    await notification.save();

    return res.status(200).json({
      success: true,
      message:
        "Notification marked as read",
    });
  } catch (error) {
    console.error(
      "Mark notification read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating notification",
    });
  }
};

// ========================================
// MARK ALL AS READ
// ========================================

const markAllNotificationsRead = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    await Notification.updateMany(
      {
        recipientId: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating notifications",
    });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};