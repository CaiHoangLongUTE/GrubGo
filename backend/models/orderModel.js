import mongoose from "mongoose";

const shopOrderItemSchema = new mongoose.Schema({
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
    name: String,
    price: Number,
    quantity: Number,
    note: { type: String, default: "" },
}, { timestamps: true });

const shopOrderSchema = new mongoose.Schema({
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    subTotal: Number,
    deliveryFee: { type: Number, default: 0 },
    payment: { type: Boolean, default: false },
    paymentAt: { type: Date, default: null },
    shopOrderItems: [shopOrderItemSchema],
    status: { type: String, enum: ["pending", "preparing", "out of delivery", "delivered"], default: "pending" },
    assignedDeliveryPerson: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deliveryOtp: { type: String, default: null },
    deliveryAt: { type: Date, default: null },
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    paymentMethod: { type: String, enum: ["cod", "online"], required: true },
    deliveryAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },
    totalItemsPrice: { type: Number, default: 0 },
    totalDeliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number },
    shopOrders: [shopOrderSchema],
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;

