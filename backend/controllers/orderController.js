import DeliveryAssignment from '../models/deliveryAssignmentModel.js';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import { sendDeliveryOtpEmail } from '../utils/mail.js';
import Shop from './../models/shopModel.js';

export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }
        if (!deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude) {
            return res.status(400).json({ message: "Delivery address is invalid" });
        }
        const groupItemsByShop = {}
        cartItems.forEach(item => {
            const shopId = item.shop;
            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = [];
            }
            groupItemsByShop[shopId].push(item);
        })
        const shopOrders = await Promise.all(
            Object.keys(groupItemsByShop).map(async (shopId) => {
                const shop = await Shop.findById(shopId).populate("owner");
                if (!shop) throw new Error(`Shop with id ${shopId} not found`);

                const items = groupItemsByShop[shopId];
                const subTotal = items.reduce(
                    (total, item) => total + Number(item.price) * Number(item.quantity),
                    0
                );

                return {
                    shop: shop._id,
                    owner: shop.owner._id,
                    subTotal,
                    shopOrderItems: items.map((item) => ({
                        item: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                    })),
                }
            })
        )

        const newOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders,
        })
        await newOrder.populate("shopOrders.shopOrderItems.item", "name image price");
        await newOrder.populate("shopOrders.shop", "name");
        await newOrder.populate("shopOrders.owner", "name socketId");
        await newOrder.populate("user", "name email mobile");

        const io = req.app.get("io");
        if (io) {
            newOrder.shopOrders.forEach(shopOrder => {
                const ownerSocketId = shopOrder.owner.socketId;
                if (ownerSocketId) {
                    io.to(ownerSocketId).emit("newOrder", {
                        _id: newOrder._id,
                        paymentMethod: newOrder.paymentMethod,
                        user: newOrder.user,
                        shopOrders: shopOrder,
                        createdAt: newOrder.createdAt,
                        deliveryAddress: newOrder.deliveryAddress,
                        payment: newOrder.payment,
                    })
                }
            })
        }

        return res.status(201).json(newOrder);
    } catch (error) {
        return res.status(500).json({ message: `Place order failed. Error: ${error.message}` });
    }
}

export const getMyOrders = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role === "user") {
            const orders = await Order.find({ user: req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "name email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")

            return res.status(200).json(orders);
        } else if (user.role === "owner") {
            const orders = await Order.find({ "shopOrders.owner": req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("user")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("shopOrders.assignedDeliveryPerson", "fullName mobile")

            const filteredOrders = orders.map((order => ({
                _id: order._id,
                paymentMethod: order.paymentMethod,
                user: order.user,
                shopOrders: order.shopOrders.find(o => o.owner._id == req.userId),
                createdAt: order.createdAt,
                deliveryAddress: order.deliveryAddress,
                payment: order.payment,
            })))
            return res.status(200).json(filteredOrders);
        }
    } catch (error) {
        return res.status(500).json({ message: `Get user orders failed. Error: ${error.message}` });
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopId } = req.params;
        const { status } = req.body;
        const order = await Order.findById(orderId);
        const shopOrder = order.shopOrders.find(o => o.shop == shopId);
        if (!shopOrder) {
            return res.status(404).json({ message: "Shop order not found" });
        }
        shopOrder.status = status;
        let deliveryPersonPayload = [];
        if (status == "out of delivery" && !shopOrder.assignment) {
            const { longitude, latitude } = order.deliveryAddress;
            const nearByDeliveryPerson = await User.find({
                role: "delivery",
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [longitude, latitude]
                        },
                        $maxDistance: 5000,
                    }
                }
            })
            const nearByIds = nearByDeliveryPerson.map(p => p._id);
            const busyIds = await DeliveryAssignment.find({
                assignedTo: { $in: nearByIds },
                status: { $nin: ["brodcasted", "assigned", "completed"] }
            }).distinct("assignedTo");
            const busyIdsSet = new Set(busyIds.map(id => String(id)));
            const availableDeliveryPerson = nearByDeliveryPerson.filter(p => !busyIdsSet.has(String(p._id)));
            const candidates = availableDeliveryPerson.map(p => p._id);
            if (candidates.length == 0) {
                await order.save();
                return res.status(200).json({ message: "No delivery person available" });
            }
            const deliveryAssignment = await DeliveryAssignment.create({
                order: order._id,
                shop: shopOrder.shop,
                shopOrderId: shopOrder._id,
                brodcastedTo: candidates,
                status: "brodcasted"
            })

            shopOrder.assignedDeliveryPerson = deliveryAssignment.assignedTo;
            shopOrder.assignment = deliveryAssignment._id;
            deliveryPersonPayload = availableDeliveryPerson.map(p => ({
                id: p._id,
                fullName: p.fullName,
                longitude: p.location.coordinates?.[0],
                latitude: p.location.coordinates?.[1],
                mobile: p.mobile,
            }))
        }

        await order.save();
        const updatedShopOrder = order.shopOrders.find(o => o.shop == shopId);
        await order.populate("shopOrders.shop", "name");
        await order.populate("shopOrders.assignedDeliveryPerson", "fullName email mobile");



        return res.status(200).json({
            shopOrder: updatedShopOrder,
            assignedDeliveryPerson: updatedShopOrder?.assignedDeliveryPerson,
            availableDeliveryPerson: deliveryPersonPayload,
            assignment: updatedShopOrder?.assignment._id,

        })
    } catch (error) {
        return res.status(500).json({ message: `Update order status failed. Error: ${error.message}` });
    }
}

export const getDeliveryPersonAssignment = async (req, res) => {
    try {
        const deliveryPersonId = req.userId;
        const assignments = await DeliveryAssignment.find({
            brodcastedTo: deliveryPersonId,
            status: "brodcasted"
        })
            .populate("order")
            .populate("shop")

        const formated = assignments.map(a => ({
            assignmentId: a._id,
            orderId: a.order._id,
            shopName: a.shop.name,
            deliveryAddress: a.order.deliveryAddress,
            items: a.order.shopOrders.find(so => so._id.equals(a.shopOrderId)).shopOrderItems || [],
            subTotal: a.order.shopOrders.find(so => so._id.equals(a.shopOrderId))?.subTotal,
        }))

        return res.status(200).json(formated);
    } catch (error) {
        return res.status(500).json({ message: `Get delivery person assignment failed. Error: ${error.message}` });
    }
}

export const acceptOrder = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const assignment = await DeliveryAssignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        if (assignment.status !== "brodcasted") {
            return res.status(400).json({ message: "Assignment is expired" });
        }
        const alreadyAssigned = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: { $nin: ["brodcasted", "completed"] }
        })
        if (alreadyAssigned) {
            return res.status(400).json({ message: "You are already assigned to another order" });
        }
        assignment.assignedTo = req.userId;
        assignment.status = "assigned";
        assignment.acceptedAt = new Date();
        await assignment.save();

        const order = await Order.findById(assignment.order);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        let shopOrder = order.shopOrders.id(assignment.shopOrderId);
        shopOrder.assignedDeliveryPerson = req.userId;
        await order.save();

        return res.status(200).json({ message: "Order accepted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Accept order failed. Error: ${error.message}` });
    }
}

export const getCurrentOrder = async (req, res) => {
    try {
        const assignment = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: "assigned"
        })
            .populate("shop", "name")
            .populate("assignedTo", "fullName email mobile location")
            .populate({
                path: "order",
                populate: [
                    { path: "user", select: "fullName email mobile location" },
                    { path: "shopOrders.shop", select: "name" },
                ]
            })

        if (!assignment) {
            return res.status(400).json({ message: "Assignment not found" });
        }
        if (!assignment.order) {
            return res.status(400).json({ message: "Order not found" });
        }
        const shopOrder = assignment.order.shopOrders.find(so => toString(so._id) == toString(assignment.shopOrderId));
        if (!shopOrder) {
            return res.status(400).json({ message: "Shop order not found" });
        }
        let deliveryPersonLocation = { lat: null, lun: null }
        if (assignment.assignedTo.location.coordinates.length == 2) {
            deliveryPersonLocation.lat = assignment.assignedTo.location.coordinates[1];
            deliveryPersonLocation.lon = assignment.assignedTo.location.coordinates[0];
        }

        const customerLocation = { lat: null, lon: null };
        if (assignment.order.deliveryAddress) {
            customerLocation.lat = assignment.order.deliveryAddress.latitude;
            customerLocation.lon = assignment.order.deliveryAddress.longitude;
        }
        return res.status(200).json({
            _id: assignment.order._id,
            user: assignment.order.user,
            shopOrder,
            deliveryAddress: assignment.order.deliveryAddress,
            deliveryPersonLocation,
            customerLocation,
        })

    } catch (error) {
        return res.status(500).json({ message: `Get current order failed. Error: ${error.message}` });
    }
}

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId)
            .populate("user")
            .populate({
                path: "shopOrders.shop",
                model: "Shop",
            })
            .populate({
                path: "shopOrders.assignedDeliveryPerson",
                model: "User",
            })
            .populate({
                path: "shopOrders.shopOrderItems.item",
                model: "Item",
            })
            .lean()

        if (!order) {
            return res.status(400).json({ message: "Order not found" });
        }
        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ message: `Get order failed. Error: ${error.message}` });
    }
}

export const sendDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.body;
        const order = await Order.findById(orderId).populate("user");
        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!order || !shopOrder) {
            return res.status(400).json({ message: "Enter valid order/shop order id" });
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        shopOrder.deliveryOtp = otp;
        shopOrder.otpExpires = Date().now + 10 * 60 * 1000;
        await order.save();
        await sendDeliveryOtpEmail(order.user, otp);

        return res.status(200).json({ message: `OTP sent to ${order?.user?.fullName} successfully` });
    } catch (error) {
        return res.status(500).json({ message: `Sending OTP failed. Error: ${error.message}` });
    }
}

export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId, otp } = req.body;
        const order = await Order.findById(orderId).populate("user");
        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!order || !shopOrder) {
            return res.status(400).json({ message: "Enter valid order/shop order id" });
        }
        if (shopOrder.deliveryOtp != otp || !shopOrder.otpExpires || shopOrder.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid/Expired OTP" });
        }

        shopOrder.status = "delivered";
        shopOrder.deliveryAt = Date.now();
        await order.save();
        await DeliveryAssignment.deleteOne({
            shopOrderId: shopOrder._id,
            order: order._id,
            assignedTo: shopOrder.assignedDeliveryPerson
        })

        return res.status(200).json({ message: "Order delivered successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Otp verification failed. Error: ${error.message}` });
    }
}