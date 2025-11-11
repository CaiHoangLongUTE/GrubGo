import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { acceptOrder, getCurrentOrder, getDeliveryPersonAssignment, getMyOrders, getOrderById, placeOrder, sendDeliveryOtp, updateOrderStatus, verifyDeliveryOtp } from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place-order", isAuth, placeOrder);
orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.get("/get-assignments", isAuth, getDeliveryPersonAssignment);
orderRouter.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus);
orderRouter.get("/accept-order/:assignmentId", isAuth, acceptOrder);
orderRouter.get("/get-current-order", isAuth, getCurrentOrder);
orderRouter.get("/get-order-by-id/:orderId", isAuth, getOrderById);
orderRouter.post("send-delivery-otp", isAuth, sendDeliveryOtp);
orderRouter.post("verify-delivery-otp", isAuth, verifyDeliveryOtp);

export default orderRouter;
    