const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController");

// TEST
router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth routes are working!",
  });
});

// REGISTER
router.post(
  "/register",
  registerUser
);

// LOGIN
router.post(
  "/login",
  loginUser
);

// GET USER PROFILE
router.get(
  "/user/:userId",
  getUserProfile
);

// UPDATE USER PROFILE
router.put(
  "/user/:userId",
  updateUserProfile
);

module.exports = router;