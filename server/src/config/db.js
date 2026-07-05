const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

async function connectDB() {
  let uri = process.env.MONGO_URI;

  if (!uri || uri === "memory") {
    console.log("Starting in-memory MongoDB...");
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
