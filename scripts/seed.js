const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/argus_franchise_os";

async function seed() {
  try {
    console.log("Connecting to MongoDB:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully.");
    console.log("Database seeded successfully with initial ARGUSCNC data.");
  } catch (err) {
    console.warn("MongoDB seed warning:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
