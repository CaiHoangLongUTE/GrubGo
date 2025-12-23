import express from "express";
import { createVnpayUrl, vnpayReturn } from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-vnpay-url", createVnpayUrl);
paymentRouter.get("/vnpay_return", vnpayReturn);

export default paymentRouter;
