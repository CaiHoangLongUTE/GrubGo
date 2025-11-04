import DeliveryAssignment from '../models/deliveryAssignment.js';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
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

            const filteredOrders = orders.map((order => ({
                _id: order._id,
                paymentMethod: order.paymentMethod,
                user: order.user,
                shopOrders: order.shopOrders.find(o => o.owner._id == req.userId),
                createdAt: order.createdAt,
                deliveryAddress: order.deliveryAddress,
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
        if (status == "out of delivery" || !shopOrder.assignment) {
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