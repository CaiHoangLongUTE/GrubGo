import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/userRoute.js";
import shopRouter from "./routes/shopRoute.js";
import itemRouter from './routes/itemRoute.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter); 
app.use("/api/user", userRouter); 
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter)

console.log("MONGODB_URL:", process.env.MONGODB_URL);

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
