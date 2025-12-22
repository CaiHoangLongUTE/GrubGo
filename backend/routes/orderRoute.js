import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { claimOrder, getCurrentOrder, getAvailableOrders, getMyOrders, getOrderById, placeOrder, updateOrderStatus, verifyDeliveryOtp, cancelShopOrder, getDeliveredOrders } from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place-order", isAuth, placeOrder);
orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.get("/available-orders", isAuth, getAvailableOrders);
orderRouter.get("/delivered-orders", isAuth, getDeliveredOrders);
orderRouter.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus);
orderRouter.post("/claim/:orderId/:shopOrderId", isAuth, claimOrder);
orderRouter.get("/get-current-order", isAuth, getCurrentOrder);
orderRouter.get("/get-order-by-id/:orderId", isAuth, getOrderById);
orderRouter.post("/verify-delivery-otp", isAuth, verifyDeliveryOtp);
orderRouter.post("/cancel/:orderId/:shopOrderId", isAuth, cancelShopOrder);


export default orderRouter;
