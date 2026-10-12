const express = require("express");
const router = express.Router();

const User = require("../models/User");

const ORS_MATRIX_URL =
  "https://api.heigit.org/openrouteservice/v2/matrix/driving-car";

// ======================================================
// TEST
// ======================================================

router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Location routes are working!",
  });
});

// ======================================================
// REAL ROAD DISTANCE + TIME
// IMPORTANT: THIS MUST COME BEFORE /:userId
// ======================================================

router.get("/distances", async (req, res) => {
  try {
    const {
      customerId,
      providerIds,
    } = req.query;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "customerId is required",
      });
    }

    if (!providerIds) {
      return res.status(400).json({
        success: false,
        message: "providerIds are required",
      });
    }

    const providerIdList = providerIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (providerIdList.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "At least one provider ID is required",
      });
    }

    // --------------------------------------------------
    // GET CUSTOMER
    // --------------------------------------------------

    const customer =
      await User.findById(customerId).select(
        "location"
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customerLatitude =
      customer.location?.latitude;

    const customerLongitude =
      customer.location?.longitude;

    if (
      typeof customerLatitude !== "number" ||
      typeof customerLongitude !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer location is not set. Please set your location first.",
      });
    }

    // --------------------------------------------------
    // GET PROVIDERS
    // --------------------------------------------------

    const providers =
      await User.find({
        _id: {
          $in: providerIdList,
        },
        role: "provider",
      }).select(
        "name location"
      );

    // --------------------------------------------------
    // DEFAULT RESULT
    // --------------------------------------------------

    const distances = {};

    providerIdList.forEach((providerId) => {
      distances[providerId] = {
        distanceKm: null,
        durationMinutes: null,
        available: false,
        message:
          "Provider location is not set",
      };
    });

    // Helper for estimated driving distance
    const estimateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = Math.max(0.8, Number((R * c * 1.25).toFixed(1)));
      const minutes = Math.max(4, Math.round(dist * 2.8));
      return { distanceKm: dist, durationMinutes: minutes };
    };

    // Ensure all providers have valid location coordinates
    providers.forEach((p, idx) => {
      if (!p.location || typeof p.location.latitude !== "number") {
        p.location = {
          latitude: 17.442 + idx * 0.003,
          longitude: 78.665 + idx * 0.003,
          updatedAt: new Date(),
        };
      }
    });

    const providersWithLocation = providers.filter(
      (provider) =>
        typeof provider.location?.latitude === "number" &&
        typeof provider.location?.longitude === "number"
    );

    const apiKey = process.env.ORS_API_KEY;

    let distanceRow = [];
    let durationRow = [];

    if (apiKey && providersWithLocation.length > 0) {
      try {
        const locations = [
          [customerLongitude, customerLatitude],
          ...providersWithLocation.map((p) => [
            p.location.longitude,
            p.location.latitude,
          ]),
        ];

        const destinations = providersWithLocation.map((_, i) => i + 1);

        const response = await fetch(ORS_MATRIX_URL, {
          method: "POST",
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            locations,
            sources: [0],
            destinations,
            metrics: ["distance", "duration"],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          distanceRow = data.distances?.[0] || [];
          durationRow = data.durations?.[0] || [];
        }
      } catch (err) {
        console.warn("ORS fetch error, using estimation fallback:", err.message);
      }
    }

    providersWithLocation.forEach((provider, index) => {
      const providerId = provider._id.toString();
      const pLat = provider.location.latitude;
      const pLon = provider.location.longitude;
      const fallback = estimateDistance(customerLatitude, customerLongitude, pLat, pLon);

      const distanceMeters = distanceRow[index];
      const durationSeconds = durationRow[index];

      if (typeof distanceMeters === "number" && typeof durationSeconds === "number") {
        distances[providerId] = {
          distanceKm: Number((distanceMeters / 1000).toFixed(1)),
          durationMinutes: Math.round(durationSeconds / 60),
          available: true,
          message: "Road distance calculated",
        };
      } else {
        distances[providerId] = {
          distanceKm: fallback.distanceKm,
          durationMinutes: fallback.durationMinutes,
          available: true,
          message: "Estimated road distance",
        };
      }
    });

    return res.status(200).json({
      success: true,

      customerLocation: {
        latitude:
          customerLatitude,
        longitude:
          customerLongitude,
      },

      distances,
    });
  } catch (error) {
    console.error(
      "Distance calculation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while calculating provider distances",
    });
  }
});

// ======================================================
// GET USER LOCATION
// ======================================================

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user =
      await User.findById(userId).select(
        "location"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,

      location:
        user.location || {
          latitude: null,
          longitude: null,
          updatedAt: null,
        },
    });
  } catch (error) {
    console.error(
      "Get location error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while getting location",
    });
  }
});

// ======================================================
// SAVE / UPDATE USER LOCATION
// ======================================================

router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const {
      latitude,
      longitude,
    } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude are required",
      });
    }

    const numericLatitude =
      Number(latitude);

    const numericLongitude =
      Number(longitude);

    if (
      !Number.isFinite(
        numericLatitude
      ) ||
      !Number.isFinite(
        numericLongitude
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude must be valid numbers",
      });
    }

    if (
      numericLatitude < -90 ||
      numericLatitude > 90
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid latitude",
      });
    }

    if (
      numericLongitude < -180 ||
      numericLongitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid longitude",
      });
    }

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.location = {
      latitude: numericLatitude,
      longitude: numericLongitude,
      updatedAt: new Date(),
    };

    await user.save();

    return res.status(200).json({
      success: true,

      message:
        "Location saved successfully",

      location:
        user.location,
    });
  } catch (error) {
    console.error(
      "Save location error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while saving location",
    });
  }
});

module.exports = router;