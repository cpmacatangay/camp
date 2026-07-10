const mongoose = require("mongoose");

async function connectDB() {
  let uri = process.env.MONGO_URI;

  if (!uri || uri === "memory") {
    if (process.env.NODE_ENV === "production") {
      console.error("MONGO_URI must be set in production");
      process.exit(1);
    }
    console.log("WARNING: running in-memory MongoDB — data not persisted");
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    console.log(`In-memory MongoDB started at ${uri}`);
  }

  try {
    await mongoose.connect(uri);
    console.log("🟢 MongoDB connected");
  } catch (err) {
    console.error("🔴 MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
