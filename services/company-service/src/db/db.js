import mongoose from "mongoose";

// Connect to MongoDB
export const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export const disconnect = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  } catch (error) {
    console.error("MongoDB disconnection error:", error);
    throw error;
  }
};

