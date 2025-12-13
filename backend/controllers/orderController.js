import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Shop from './../models/shopModel.js';
import Address from '../models/addressModel.js';

export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddressId, totalAmount } = req.body;
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }
        if (!deliveryAddressId) {
            return res.status(400).json({ message: "Delivery address ID is required" });
        }

        // Verify address exists and belongs to user
        const address = await Address.findOne({ _id: deliveryAddressId, user: req.userId });
        if (!address) {
            return res.status(404).json({ message: "Address not found or does not belong to you" });
        }
        const groupItemsByShop = {}
        cartItems.forEach(item => {
            // Handle both populated object and string ID for shop
            const shopId = typeof item.shop === 'object' ? item.shop._id : item.shop;
            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = [];
            }
            groupItemsByShop[shopId].push(item);
        })

        const deg2rad = (deg) => deg * (Math.PI / 180);
        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Radius of the earth in km
            const dLat = deg2rad(lat2 - lat1);
            const dLon = deg2rad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; // Distance in km
        }

        let calculatedTotalItemsPrice = 0;
        let calculatedTotalDeliveryFee = 0;

        const shopOrders = await Promise.all(
            Object.keys(groupItemsByShop).map(async (shopId) => {
                const shop = await Shop.findById(shopId).populate("owner");
                if (!shop) throw new Error(`Shop with id ${shopId} not found`);

                const items = groupItemsByShop[shopId];
                const subTotal = items.reduce(
                    (total, item) => total + Number(item.price) * Number(item.quantity),
                    0
                );

                // Calculate Delivery Fee for this shop
                let deliveryFee = 15000; // Default
                if (shop.lat && shop.lon) {
                    const dist = calculateDistance(
                        address.lat,
                        address.lon,
                        shop.lat,
                        shop.lon
                    );
                    if (dist > 3) {
                        deliveryFee += Math.ceil(dist - 3) * 5000;
                    }
                }

                calculatedTotalItemsPrice += subTotal;
                calculatedTotalDeliveryFee += deliveryFee;

                // Generate OTP for this shopOrder
                const otp = Math.floor(1000 + Math.random() * 9000).toString();

                return {
                    shop: shop._id,
                    owner: shop.owner._id,
                    subTotal,
                    deliveryFee,
                    payment: paymentMethod === "online", // If online, sub-orders are paid
                    deliveryOtp: otp, // Generate OTP at order creation
                    shopOrderItems: items.map((item) => ({
                        item: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        note: item.note || "", // Save note
                    })),
                }
            })
        )

        const newOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress: deliveryAddressId,
            totalItemsPrice: calculatedTotalItemsPrice,
            totalDeliveryFee: calculatedTotalDeliveryFee,
            totalAmount: calculatedTotalItemsPrice + calculatedTotalDeliveryFee,
            shopOrders,
        })
        await newOrder.populate("shopOrders.shopOrderItems.item", "name image price");
        await newOrder.populate("shopOrders.shop", "name");
        await newOrder.populate("shopOrders.owner", "name socketId");
        await newOrder.populate("user", "name email mobile");
        await newOrder.populate("deliveryAddress");

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
                .populate("deliveryAddress")

            return res.status(200).json(orders);
        } else if (user.role === "owner") {
            const orders = await Order.find({ "shopOrders.owner": req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("user")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("shopOrders.assignedDeliveryPerson", "fullName mobile")
                .populate("deliveryAddress")

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
        const order = await Order.findById(orderId).populate('deliveryAddress');
        const shopOrder = order.shopOrders.find(o => o.shop == shopId);
        if (!shopOrder) {
            return res.status(404).json({ message: "Shop order not found" });
        }
        shopOrder.status = status;
        let deliveryPersonPayload = [];

        // When status changes to "out of delivery", notify nearby available delivery persons
        if (status == "out of delivery" && !shopOrder.assignedDeliveryPerson) {
            const { lon, lat } = order.deliveryAddress;

            // Find nearby delivery persons
            const nearByDeliveryPerson = await User.find({
                role: "delivery",
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [lon, lat]
                        },
                        $maxDistance: 5000,
                    }
                }
            })

            const nearByIds = nearByDeliveryPerson.map(p => p._id);

            // Find busy delivery persons (those with active deliveries)
            const busyOrders = await Order.find({
                "shopOrders.assignedDeliveryPerson": { $in: nearByIds },
                "shopOrders.status": { $in: ["out of delivery"] }
            });

            const busyIds = new Set();
            busyOrders.forEach(order => {
                order.shopOrders.forEach(so => {
                    if (so.assignedDeliveryPerson && so.status === "out of delivery") {
                        busyIds.add(String(so.assignedDeliveryPerson));
                    }
                });
            });

            const availableDeliveryPerson = nearByDeliveryPerson.filter(p => !busyIds.has(String(p._id)));

            if (availableDeliveryPerson.length == 0) {
                await order.save();
                return res.status(200).json({ message: "No delivery person available" });
            }

            deliveryPersonPayload = availableDeliveryPerson.map(p => ({
                id: p._id,
                fullName: p.fullName,
                longitude: p.location.coordinates?.[0],
                latitude: p.location.coordinates?.[1],
                mobile: p.mobile,
            }))

            // Emit socket event to available delivery persons
            const io = req.app.get("io");
            if (io) {
                // Populate user to get details for socket payload
                await order.populate("user", "fullName mobile");
                await order.populate("shopOrders.shop", "name address city state");

                availableDeliveryPerson.forEach(person => {
                    if (person.socketId) {
                        io.to(person.socketId).emit("newDeliveryAvailable", {
                            orderId: order._id,
                            shopOrderId: shopOrder._id,
                            shop: {
                                name: shopOrder.shop?.name,
                                address: shopOrder.shop?.address,
                                city: shopOrder.shop?.city,
                                state: shopOrder.shop?.state
                            },
                            deliveryAddress: order.deliveryAddress,
                            items: shopOrder.shopOrderItems || [],
                            subTotal: shopOrder.subTotal,
                            deliveryFee: shopOrder.deliveryFee,
                            customer: {
                                name: order.user?.fullName,
                                mobile: order.user?.mobile
                            }
                        });
                    }
                });
            }
        }

        await order.save();
        const updatedShopOrder = order.shopOrders.find(o => o.shop == shopId);
        await order.populate("shopOrders.shop", "name address city state");
        await order.populate("shopOrders.assignedDeliveryPerson", "fullName email mobile");

        await order.populate("user", "socketId");

        // Send real-time notification to user when status changes
        const io = req.app.get("io");
        if (io && order.user?.socketId) {
            const userSocketId = order.user.socketId;
            io.to(userSocketId).emit("statusUpdate", {
                orderId: order._id,
                shopId: shopId,
                status: status
            });
        }


        return res.status(200).json({
            shopOrder: updatedShopOrder,
            assignedDeliveryPerson: updatedShopOrder?.assignedDeliveryPerson,
            availableDeliveryPerson: deliveryPersonPayload,
        })
    } catch (error) {
        return res.status(500).json({ message: `Update order status failed. Error: ${error.message}` });
    }
}

export const getAvailableOrders = async (req, res) => {
    try {
        const deliveryPersonId = req.userId;

        // Get delivery person's location
        const deliveryPerson = await User.findById(deliveryPersonId);
        if (!deliveryPerson || !deliveryPerson.location) {
            return res.status(400).json({ message: "Delivery person location not found" });
        }

        const [longitude, latitude] = deliveryPerson.location.coordinates;

        // Find orders with unclaimed shopOrders
        const orders = await Order.find({
            "shopOrders.status": "out of delivery",
            "shopOrders.assignedDeliveryPerson": null
        })
            .populate("shopOrders.shop", "name address city state")
            .populate("shopOrders.shopOrderItems.item", "name image price")
            .populate("user", "fullName mobile")
            .populate("deliveryAddress");

        // Filter orders by distance (within ~5km)
        const availableOrders = [];
        orders.forEach(order => {
            if (!order.deliveryAddress || !order.deliveryAddress.lon || !order.deliveryAddress.lat) return;

            const lonDiff = Math.abs(order.deliveryAddress.lon - longitude);
            const latDiff = Math.abs(order.deliveryAddress.lat - latitude);

            // Rough distance check (0.05 degrees ~ 5km)
            if (lonDiff <= 0.05 && latDiff <= 0.05) {
                order.shopOrders.forEach(shopOrder => {
                    if (shopOrder.status === "out of delivery" && !shopOrder.assignedDeliveryPerson) {
                        const shop = shopOrder.shop || {};
                        availableOrders.push({
                            orderId: order._id,
                            shopOrderId: shopOrder._id,
                            shop: {
                                name: shop.name,
                                address: shop.address,
                                city: shop.city,
                                state: shop.state,
                            },
                            deliveryAddress: order.deliveryAddress,
                            items: shopOrder.shopOrderItems || [],
                            subTotal: shopOrder.subTotal,
                            deliveryFee: shopOrder.deliveryFee,
                            customer: {
                                name: order.user?.fullName,
                                mobile: order.user?.mobile
                            }
                        });
                    }
                });
            }
        });

        return res.status(200).json(availableOrders);
    } catch (error) {
        return res.status(500).json({ message: `Get available orders failed. Error: ${error.message}` });
    }
}

export const claimOrder = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.params;
        const deliveryPersonId = req.userId;

        // Check if delivery person already has an active delivery
        const activeDelivery = await Order.findOne({
            "shopOrders.assignedDeliveryPerson": deliveryPersonId,
            "shopOrders.status": "out of delivery"
        });

        if (activeDelivery) {
            return res.status(400).json({ message: "You already have an active delivery" });
        }

        // Use findOneAndUpdate with atomic operation to prevent race condition
        const order = await Order.findOneAndUpdate(
            {
                "_id": orderId,
                "shopOrders._id": shopOrderId,
                "shopOrders.status": "out of delivery",
                "shopOrders.assignedDeliveryPerson": null
            },
            {
                "$set": { "shopOrders.$.assignedDeliveryPerson": deliveryPersonId }
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found or already claimed" });
        }

        // Emit socket event to User and Shop Owner
        const io = req.app.get("io");
        if (io) {
            // Need to populate user first to get socketId
            await order.populate("user");

            // Notify User
            if (order.user?.socketId) {
                // Determine shopOrder index or ID to help frontend
                const shopOrder = order.shopOrders.id(shopOrderId);
                const deliveryPersonData = await User.findById(deliveryPersonId).select("fullName mobile email location");

                io.to(order.user.socketId).emit("deliveryAssigned", {
                    orderId: order._id, // This is an ObjectId
                    shopOrderId: shopOrderId,
                    deliveryPerson: deliveryPersonData,
                    status: "out of delivery"
                });
            }

            // Notify Shop Owner
            const shopOrder = order.shopOrders.id(shopOrderId);
            if (shopOrder) {
                // We need to populate owner to get socketId if not already populated? 
                // shopOrder.owner is an ObjectId in the schema, let's populate it to be safe or find it.
                // Actually in the schema shopOrders.owner is ref to User.
                // The query `findOneAndUpdate` returns the document *before* population if not specified, 
                // but we use `new: true`. However, `owner` field might just be ID if not populated.
                // Let's refetch or stick to ID if we have a way to get socket.
                // Best to simple fetch owner user to get socketId.
                const ownerUser = await User.findById(shopOrder.owner);
                if (ownerUser && ownerUser.socketId) {
                    const deliveryPersonData = await User.findById(deliveryPersonId).select("fullName mobile email location");
                    io.to(ownerUser.socketId).emit("deliveryAssigned", {
                        orderId: order._id,
                        shopOrderId: shopOrderId,
                        deliveryPerson: deliveryPersonData,
                        status: "out of delivery"
                    });
                }
            }
        }

        return res.status(200).json({ message: "Order claimed successfully", order });
    } catch (error) {
        return res.status(500).json({ message: `Claim order failed. Error: ${error.message}` });
    }
}


export const getCurrentOrder = async (req, res) => {
    try {
        const deliveryPersonId = req.userId;

        // Find order where this delivery person has an active delivery
        const order = await Order.findOne({
            "shopOrders.assignedDeliveryPerson": deliveryPersonId,
            "shopOrders.status": "out of delivery"
        })
            .populate("user", "fullName email mobile")
            .populate("shopOrders.shop", "name address city state")
            .populate("shopOrders.shopOrderItems.item", "name image price")
            .populate("deliveryAddress");

        if (!order) {
            return res.status(404).json({ message: "No active delivery found" });
        }

        // Find the specific shopOrder assigned to this delivery person
        const shopOrder = order.shopOrders.find(so =>
            so.assignedDeliveryPerson &&
            so.assignedDeliveryPerson.toString() === deliveryPersonId &&
            so.status === "out of delivery"
        );

        if (!shopOrder) {
            return res.status(404).json({ message: "Shop order not found" });
        }

        // Get delivery person's location
        const deliveryPerson = await User.findById(deliveryPersonId);
        let deliveryPersonLocation = { lat: null, lon: null };
        if (deliveryPerson?.location?.coordinates?.length === 2) {
            deliveryPersonLocation.lat = deliveryPerson.location.coordinates[1];
            deliveryPersonLocation.lon = deliveryPerson.location.coordinates[0];
        }

        const customerLocation = { lat: null, lon: null };
        if (order.deliveryAddress) {
            customerLocation.lat = order.deliveryAddress.lat;
            customerLocation.lon = order.deliveryAddress.lon;
        }

        return res.status(200).json({
            _id: order._id,
            user: order.user,
            shopOrder,
            deliveryAddress: order.deliveryAddress,
            deliveryPersonLocation,
            customerLocation,
        });

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
            .populate("deliveryAddress")
            .lean()

        if (!order) {
            return res.status(400).json({ message: "Order not found" });
        }
        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ message: `Get order failed. Error: ${error.message}` });
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
        if (shopOrder.deliveryOtp != otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        shopOrder.status = "delivered";
        shopOrder.deliveryAt = Date.now();
        await order.save();

        // Emit socket event for status update
        const io = req.app.get("io");
        if (io) {
            // Notify User
            if (order.user?.socketId) {
                io.to(order.user.socketId).emit("statusUpdate", {
                    orderId: order._id,
                    shopId: shopOrder.shop, // shopOrder.shop is ObjectId
                    status: "delivered"
                });
            }

            // Notify Shop Owner
            const ownerUser = await User.findById(shopOrder.owner);
            if (ownerUser && ownerUser.socketId) {
                io.to(ownerUser.socketId).emit("statusUpdate", {
                    orderId: order._id,
                    shopId: shopOrder.shop,
                    status: "delivered"
                });
            }
        }

        return res.status(200).json({ message: "Order delivered successfully" });
    } catch (error) {
        return res.status(500).json({ message: `Otp verification failed. Error: ${error.message}` });
    }
}