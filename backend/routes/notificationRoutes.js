const express = require("express");

const router = express.Router();

const {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");

// GET USER NOTIFICATIONS

router.get(
  "/:userId",
  getUserNotifications
);

// MARK ONE AS READ

router.put(
  "/:notificationId/read",
  markNotificationRead
);

// MARK ALL AS READ

router.put(
  "/user/:userId/read-all",
  markAllNotificationsRead
);

module.exports = router;