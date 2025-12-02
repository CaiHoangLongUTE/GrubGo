import moment from "moment";
import querystring from "qs";
import crypto from "crypto";
import { vnpayConfig } from "../config/vnpayConfig.js";
import Order from "../models/orderModel.js";

function sortObject(obj) {
    let sorted = {};
    let keys = Object.keys(obj).sort(); // chỉ sort theo key gốc

    keys.forEach((key) => {
        if (obj[key] !== null && obj[key] !== undefined && obj[key] !== "") {
            // encode value, thay %20 bằng +
            sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
        }
    });

    return sorted;
}




export const createVnpayUrl = async (req, res) => {
    try {
        const { totalAmount, orderId } = req.body;

        let ipAddr =
            req.headers["x-forwarded-for"] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            "127.0.0.1";

        if (ipAddr === "::1") ipAddr = "127.0.0.1"; // Fix IPv6 loopback

        const date = new Date();
        const createDate = moment(date).format("YYYYMMDDHHmmss");
        const txnRef = moment(date).format("HHmmss");

        const tmnCode = vnpayConfig.vnp_TmnCode;
        const secretKey = vnpayConfig.vnp_HashSecret;
        const vnpUrl = vnpayConfig.vnp_Url;
        const returnUrl = vnpayConfig.vnp_ReturnUrl;

        const amount = Math.round(totalAmount * 100);

        let vnp_Params = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: tmnCode,
            vnp_Locale: "vn",
            vnp_CurrCode: "VND",
            vnp_TxnRef: txnRef,
            vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
            vnp_OrderType: "billpayment",
            vnp_Amount: amount,
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
        };

        vnp_Params = sortObject(vnp_Params);

        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const secureHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

        vnp_Params["vnp_SecureHash"] = secureHash;

        const paymentUrl = `${vnpUrl}?${querystring.stringify(vnp_Params, { encode: false })}`;

        // Logging đầy đủ như bản mẫu
        console.log("[CREATE] Params used for signing:", vnp_Params);
        console.log("🔹 [CREATE] signData:", signData);
        console.log("🔹 [CREATE] secureHash:", secureHash);
        console.log("🔹 [CREATE] URL:", paymentUrl);
        console.log("✅ VNPAY CONFIG:", vnpayConfig);

        res.status(200).json({ paymentUrl });
    } catch (error) {
        console.error("❌ [CREATE] Error:", error);
        res.status(500).json({ message: "Tạo URL thanh toán thất bại" });
    }
};



// ✅ Xử lý callback từ VNPAY
export const vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params["vnp_SecureHash"];
        delete vnp_Params["vnp_SecureHash"];
        delete vnp_Params["vnp_SecureHashType"];

        const sortedParams = sortObject(vnp_Params); // ✅ KHÔNG encode value
        const signData = querystring.stringify(sortedParams, { encode: false });

        const signed = crypto
            .createHmac("sha512", vnpayConfig.vnp_HashSecret)
            .update(Buffer.from(signData, "utf-8"))
            .digest("hex");

        console.log("🔹 signData:", signData);
        console.log("🔹 secureHash:", secureHash);
        console.log("🔹 signed:", signed);

        if (secureHash !== signed) {
            return res.status(400).json({ message: "Sai chữ ký" });
        }

        // ✅ thanh toán thành công
        if (vnp_Params['vnp_ResponseCode'] === '00') {
            const orderInfo = vnp_Params['vnp_OrderInfo'];
            const cleanOrderInfo = orderInfo.replace(/\+/g, ' ');
            const orderId = cleanOrderInfo.split(' ').pop();

            const order = await Order.findById(orderId);
            if (order) {
                // Cập nhật payment status
                order.payment = true;
                if (order.shopOrders) {
                    order.shopOrders.forEach(so => {
                        so.payment = true;
                        so.paymentAt = new Date();
                    });
                }
                await order.save();

                // Populate thông tin để gửi real-time
                await order.populate("shopOrders.shopOrderItems.item", "name image price");
                await order.populate("shopOrders.shop", "name");
                await order.populate("shopOrders.owner", "name socketId");
                await order.populate("user", "name email mobile");

                // ✅ Gửi thông báo real-time cho owner
                const io = req.app.get("io");
                if (io) {
                    order.shopOrders.forEach(shopOrder => {
                        const ownerSocketId = shopOrder.owner.socketId;
                        if (ownerSocketId) {
                            io.to(ownerSocketId).emit("newOrder", {
                                _id: order._id,
                                paymentMethod: order.paymentMethod,
                                user: order.user,
                                shopOrders: shopOrder,
                                createdAt: order.createdAt,
                                deliveryAddress: order.deliveryAddress,
                                payment: order.payment,
                            });
                        }
                    });
                }
            }

            // ✅ Redirect về trang order-placed
            return res.redirect(`http://localhost:5173/order-placed`);
        } else {
            // Thanh toán thất bại, redirect về cart
            return res.redirect(`http://localhost:5173/cart`);
        }

    } catch (error) {
        console.error("❌ Error:", error);
        console.log("🔹 secureHash:", secureHash);
        console.log("🔹 signed:", signed);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};



