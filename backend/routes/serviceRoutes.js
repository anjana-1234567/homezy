
const express = require("express");
const router = express.Router();

const {
  addService,
  getProviderServices,
  updateService,
  deleteService,
  getAllActiveServices,
  getAllServicesForAdmin,
} = require("../controllers/serviceController");

// ========================================
// TEST SERVICE ROUTE
// GET /api/services/test
// ========================================
router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Service routes are working!",
  });
});

// ========================================
// ADMIN: GET ALL SERVICES
// GET /api/services/admin/all
// Includes ACTIVE and INACTIVE services
// ========================================
router.get("/admin/all", getAllServicesForAdmin);

// ========================================
// ADD NEW SERVICE
// POST /api/services
// ========================================
router.post("/", addService);

// ========================================
// GET PROVIDER SERVICES
// GET /api/services/provider/:providerId
// ========================================
router.get("/provider/:providerId", getProviderServices);

// ========================================
// GET ALL ACTIVE SERVICES
// GET /api/services
// ========================================
router.get("/", getAllActiveServices);

// ========================================
// UPDATE SERVICE
// PUT /api/services/:serviceId
// ========================================
router.put("/:serviceId", updateService);

// ========================================
// DELETE SERVICE
// DELETE /api/services/:serviceId
// ========================================
router.delete("/:serviceId", deleteService);

module.exports = router;
