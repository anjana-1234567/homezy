const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");

    const adminEmail = "admin@homezy.com";
    const adminPassword = "Admin@123";

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("Admin account already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      adminPassword,
      10
    );

    const admin = await User.create({
      name: "Homezy Admin",
      email: adminEmail,
      phone: "9999999999",
      password: hashedPassword,
      role: "admin",
      accountStatus: "ACTIVE",
      approvalStatus: "APPROVED",
      address: "",
      serviceCategories: [],
      experience: "",
    });

    console.log("====================================");
    console.log("ADMIN CREATED SUCCESSFULLY");
    console.log("Email:", admin.email);
    console.log("Password:", adminPassword);
    console.log("Role:", admin.role);
    console.log("====================================");

    process.exit(0);
  } catch (error) {
    console.error("ADMIN CREATION ERROR:", error);
    process.exit(1);
  }
};

createAdmin();