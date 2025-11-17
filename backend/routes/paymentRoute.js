import express from "express";
import { createVnpayUrl, vnpayReturn } from "../controllers/paymentController.js";

const PaymentRouter = express.Router();

PaymentRouter.post("/create-vnpay-url", createVnpayUrl);
PaymentRouter.get("/vnpay_return", vnpayReturn);

export default PaymentRouter;
