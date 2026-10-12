const dns = require("node:dns");
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const path = require("node:path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function createAdmin() {
  try {
    const {
      MONGO_URI,
      ADMIN_NAME,
      ADMIN_EMAIL,
      ADMIN_PHONE,
      ADMIN_PASSWORD,
    } = process.env;

    const required = {
      MONGO_URI,
      ADMIN_NAME,
      ADMIN_EMAIL,
      ADMIN_PHONE,
      ADMIN_PASSWORD,
    };

    const missing = Object.entries(required)
      .filter(([, value]) => !value || !value.trim())
      .map(([key]) => key);

    if (missing.length > 0) {
      throw new Error(
        "Missing .env variables: " + missing.join(", ")
      );
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error(
        "ADMIN_PASSWORD must contain at least 12 characters."
      );
    }

    const email = ADMIN_EMAIL.trim().toLowerCase();

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 20000,
    });

    console.log("MongoDB Atlas connected successfully");

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role === "admin") {
        console.log("Admin account already exists.");
      } else {
        throw new Error(
          "This email belongs to a non-admin user. Choose another admin email."
        );
      }

      return;
    }

    const hashedPassword = await bcrypt.hash(
      ADMIN_PASSWORD,
      12
    );

    await User.create({
      name: ADMIN_NAME.trim(),
      email,
      phone: ADMIN_PHONE.trim(),
      password: hashedPassword,
      role: "admin",
      accountStatus: "ACTIVE",
      approvalStatus: "APPROVED",
    });

    console.log("Admin account created successfully!");
    console.log("Admin email:", email);
    console.log("Use the ADMIN_PASSWORD configured in .env to log in.");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
  }
}

createAdmin();