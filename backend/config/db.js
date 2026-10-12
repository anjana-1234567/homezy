const dns = require("node:dns");
const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = (process.env.MONGO_URI || "").trim().replace(/^["']|["']$/g, "").trim();

  if (!uri) {
    console.error("MongoDB Error: MONGO_URI is missing in environment variables!");
    return;
  }

  // 1. Try standard system DNS first (works best in cloud containers like Render / Linux)
  try {
    await mongoose.connect(uri, {
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

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB Atlas connected successfully via fallback DNS");
    console.log("Database:", mongoose.connection.name);
  } catch (fallbackError) {
    console.error("MongoDB Atlas connection failed:", fallbackError.message);
  }

  // 3. Background periodic retry if disconnected
  if (mongoose.connection.readyState !== 1 && !global.__mongoRetryInterval) {
    global.__mongoRetryInterval = setInterval(async () => {
      if (mongoose.connection.readyState === 1) {
        clearInterval(global.__mongoRetryInterval);
        global.__mongoRetryInterval = null;
        return;
      }

      const retryUri = (process.env.MONGO_URI || "").trim().replace(/^["']|["']$/g, "").trim();
      if (!retryUri) return;

      try {
        await mongoose.connect(retryUri, { serverSelectionTimeoutMS: 8000 });
        console.log("MongoDB Atlas connected successfully via background retry");
        clearInterval(global.__mongoRetryInterval);
        global.__mongoRetryInterval = null;
      } catch (err) {
        // Will retry on next tick
      }
    }, 20000);
  }
};

module.exports = connectDB;