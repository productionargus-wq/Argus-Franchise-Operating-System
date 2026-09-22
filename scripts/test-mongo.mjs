import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/argus_franchise_os";

async function testConnection() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log("✅ Successfully connected to MongoDB Atlas!");
    console.log("Database Name:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
    await mongoose.disconnect();
    console.log("Connection closed cleanly.");
  } catch (error) {
    console.error("❌ MongoDB Atlas connection error:", error.message);
  }
}

testConnection();
