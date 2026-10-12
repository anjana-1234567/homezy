const Service = require("../models/Service");
const User = require("../models/User");

// ========================================
// ADD SERVICE
// ========================================

const addService = async (req, res) => {
  try {
    const {
      providerId,
      category,
      serviceName,
      price,
      description,
    } = req.body;

    if (
      !providerId ||
      !category ||
      !serviceName ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Provider, category, service name and price are required",
      });
    }

    const provider =
      await User.findById(providerId);

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    if (provider.role !== "provider") {
      return res.status(400).json({
        success: false,
        message:
          "Only providers can add services",
      });
    }

    const existingService =
      await Service.findOne({
        providerId,
        serviceName:
          serviceName.trim(),
      });

    if (existingService) {
      return res.status(409).json({
        success: false,
        message:
          "You already have this service",
      });
    }

    const service =
      await Service.create({
        providerId,
        category:
          category.trim(),
        serviceName:
          serviceName.trim(),
        price: Number(price),
        description:
          description?.trim() || "",
        status: "ACTIVE",
      });

    return res.status(201).json({
      success: true,
      message:
        "Service added successfully",
      service,
    });
  } catch (error) {
    console.error(
      "Add service error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while adding service",
    });
  }
};

// ========================================
// GET PROVIDER SERVICES
// ========================================

const getProviderServices = async (
  req,
  res
) => {
  try {
    const { providerId } =
      req.params;

    const services =
      await Service.find({
        providerId,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    console.error(
      "Get provider services error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching provider services",
    });
  }
};

// ========================================
// GET ALL ACTIVE SERVICES
// CUSTOMER USES THIS
// ========================================

const getAllActiveServices = async (
  req,
  res
) => {
  try {
    const services =
      await Service.find({
        status: "ACTIVE",
      })
        .populate(
          "providerId",
          "name email phone address experience location"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    console.error(
      "Get all services error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching services",
    });
  }
};
// ========================================
// ADMIN: GET ALL SERVICES
// ========================================

const getAllServicesForAdmin = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("providerId", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalServices: services.length,
      services,
    });
  } catch (error) {
    console.error("Admin get services error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch all services",
    });
  }
};
// ========================================
// UPDATE SERVICE
// ========================================

const updateService = async (
  req,
  res
) => {
  try {
    const { serviceId } =
      req.params;

    const {
      category,
      serviceName,
      price,
      description,
      status,
    } = req.body;

    const service =
      await Service.findById(
        serviceId
      );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    if (category !== undefined) {
      service.category =
        category.trim();
    }

    if (serviceName !== undefined) {
      service.serviceName =
        serviceName.trim();
    }

    if (price !== undefined) {
      service.price =
        Number(price);
    }

    if (description !== undefined) {
      service.description =
        description.trim();
    }

    if (status !== undefined) {
      if (
        ![
          "ACTIVE",
          "INACTIVE",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid service status",
        });
      }

      service.status = status;
    }

    await service.save();

    return res.status(200).json({
      success: true,
      message:
        "Service updated successfully",
      service,
    });
  } catch (error) {
    console.error(
      "Update service error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating service",
    });
  }
};

// ========================================
// DELETE SERVICE
// ========================================

const deleteService = async (
  req,
  res
) => {
  try {
    const { serviceId } =
      req.params;

    const service =
      await Service.findById(
        serviceId
      );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    await Service.findByIdAndDelete(
      serviceId
    );

    return res.status(200).json({
      success: true,
      message:
        "Service deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete service error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while deleting service",
    });
  }
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  addService,
  getProviderServices,
  getAllActiveServices,
  getAllServicesForAdmin,
  updateService,
  deleteService,
};