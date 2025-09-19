import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB(); // thử kết nối MongoDB
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Cannot connect to MongoDB:", error.message);
    process.exit(1);
  }
};

startServer();
