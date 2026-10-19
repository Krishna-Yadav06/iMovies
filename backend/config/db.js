

const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error("Name:", error.name);
    console.error("Message:", error.message);

    for (const [host, server] of error.reason?.servers ?? []) {
  console.log(host, server.error?.message);
}

    process.exit(1);
  }
}

module.exports = connectDB;
