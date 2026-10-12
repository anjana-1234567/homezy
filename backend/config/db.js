const dns = require("node:dns");
const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MongoDB Error: MONGO_URI is missing in environment variables!");
    return;
  }

  // 1. Try standard system DNS first (works best in cloud containers like Render / Linux)
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB Atlas connected successfully");
    console.log("Database:", mongoose.connection.name);
    return;
  } catch (primaryError) {
    console.warn("Primary DNS MongoDB connection failed:", primaryError.message);
  }

  // 2. Fallback to Cloudflare DNS (fixes local ISP querySrv resolution issues on Windows)
  try {
    console.log("Retrying MongoDB connection with Cloudflare DNS fallback...");
    dns.setServers(["1.1.1.1", "1.0.0.1"]);

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB Atlas connected successfully via fallback DNS");
    console.log("Database:", mongoose.connection.name);
  } catch (fallbackError) {
    console.error("MongoDB Atlas connection failed:", fallbackError.message);
    console.error("Tip: Ensure 0.0.0.0/0 is added to MongoDB Atlas Network Access whitelist.");
  }
};

module.exports = connectDB;