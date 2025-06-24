const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

// Connect to MongoDB
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

const disconnect = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  } catch (error) {
    console.error("MongoDB disconnection error:", error);
    throw error;
  }
};

module.exports = { connect, disconnect };
