const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getCustomerComplaints,
  getAllComplaints,
  resolveComplaint,
} = require("../controllers/complaintController");

router.post("/", createComplaint);

router.get("/admin/all", getAllComplaints);

router.get("/customer/:customerId", getCustomerComplaints);

router.patch("/:complaintId/resolve", resolveComplaint);

module.exports = router;