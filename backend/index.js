import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/userRoute.js";
import shopRouter from "./routes/shopRoute.js";
import itemRouter from './routes/itemRoute.js';
import orderRouter from "./routes/orderRoute.js";
import PaymentRouter from "./routes/paymentRoute.js";
import addressRoute from "./routes/addressRoute.js";
import adminRouter from "./routes/adminRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import http from "http";
import { Server } from "socket.io";
import { socketHandler } from "./socket.js";
import { seedAdmin } from "./utils/seedAdmin.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["POST", "GET"]
  }
});
app.set("io", io);

const port = process.env.PORT || 8000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/address", addressRoute);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter)
app.use("/api/order", orderRouter);
app.use("/api/payment", PaymentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/category", categoryRouter);
socketHandler(io);
console.log("MONGODB_URL:", process.env.MONGODB_URL);
const startServer = async () => {
  try {
    await connectDB(); // thử kết nối MongoDB
    await seedAdmin(); // Tự động tạo admin từ env
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Cannot connect to MongoDB:", error.message);
    process.exit(1);
  }
}
startServer();
