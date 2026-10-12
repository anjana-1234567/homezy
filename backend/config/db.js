const dns = require("node:dns");
const mongoose = require("mongoose");

// Use Cloudflare DNS for Node.js DNS lookups
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 20000,
    });

    console.log("MongoDB Atlas connected successfully");
    console.log("Database:", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
   throw error;
  }
};

module.exports = connectDB;