import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Shop from './../models/shopModel.js';
import Address from '../models/addressModel.js';

export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddressId, totalAmount } = req.body;
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng trống" });
        }
        if (!deliveryAddressId) {
            return res.status(400).json({ message: "ID địa chỉ giao hàng là bắt buộc" });
        }

        // Verify address exists and belongs to user
        const address = await Address.findOne({ _id: deliveryAddressId, user: req.userId });
        if (!address) {
            return res.status(404).json({ message: "Không tìm thấy địa chỉ hoặc địa chỉ không thuộc về bạn" });
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
                if (!shop) throw new Error(`Không tìm thấy quán ăn với id ${shopId}`);

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
        return res.status(500).json({ message: `Đặt hàng thất bại. Lỗi: ${error.message}` });
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
        return res.status(500).json({ message: `Lấy đơn hàng của người dùng thất bại. Lỗi: ${error.message}` });
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopId } = req.params;
        const { status } = req.body;
        const order = await Order.findById(orderId).populate('deliveryAddress');
        const shopOrder = order.shopOrders.find(o => o.shop == shopId);
        if (!shopOrder) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng của quán" });
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
                        $maxDistance: 10000,
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
                return res.status(200).json({ message: "Không có nhân viên giao hàng khả dụng" });
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
        return res.status(500).json({ message: `Cập nhật trạng thái đơn hàng thất bại. Lỗi: ${error.message}` });
    }
}

export const getAvailableOrders = async (req, res) => {
    try {
        const deliveryPersonId = req.userId;

        // Get delivery person's location
        const deliveryPerson = await User.findById(deliveryPersonId);
        if (!deliveryPerson || !deliveryPerson.location) {
            return res.status(400).json({ message: "Không tìm thấy vị trí của nhân viên giao hàng" });
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


        const availableOrders = [];
        orders.forEach(order => {
            if (!order.deliveryAddress || !order.deliveryAddress.lon || !order.deliveryAddress.lat) return;

            const lonDiff = Math.abs(order.deliveryAddress.lon - longitude);
            const latDiff = Math.abs(order.deliveryAddress.lat - latitude);

            console.log(`[DEBUG_COORDS] DP: (${longitude}, ${latitude}) | Order: (${order.deliveryAddress.lon}, ${order.deliveryAddress.lat})`);
            console.log(`[DEBUG_DIFF] LonDiff: ${lonDiff}, LatDiff: ${latDiff} (Must be <= 0.1 for 10km)`);

            // Rough distance check
            if (lonDiff <= 0.2 && latDiff <= 0.2) {
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
        return res.status(500).json({ message: `Lấy danh sách đơn hàng khả dụng thất bại. Lỗi: ${error.message}` });
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
            return res.status(400).json({ message: "Bạn đang có một đơn hàng đang giao" });
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
            return res.status(404).json({ message: "Đơn hàng không tìm thấy hoặc đã được người khác nhận" });
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

        return res.status(200).json({ message: "Nhận đơn hàng thành công", order });
    } catch (error) {
        return res.status(500).json({ message: `Nhận đơn hàng thất bại. Lỗi: ${error.message}` });
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
            return res.status(404).json({ message: "Không tìm thấy đơn hàng đang giao" });
        }

        // Find the specific shopOrder assigned to this delivery person
        const shopOrder = order.shopOrders.find(so =>
            so.assignedDeliveryPerson &&
            so.assignedDeliveryPerson.toString() === deliveryPersonId &&
            so.status === "out of delivery"
        );

        if (!shopOrder) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng của quán" });
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
        return res.status(500).json({ message: `Lấy đơn hàng hiện tại thất bại. Lỗi: ${error.message}` });
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
            return res.status(400).json({ message: "Không tìm thấy đơn hàng" });
        }
        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ message: `Lấy thông tin đơn hàng thất bại. Lỗi: ${error.message}` });
    }
}



export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId, otp } = req.body;
        const order = await Order.findById(orderId).populate("user");
        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!order || !shopOrder) {
            return res.status(400).json({ message: "Vui lòng nhập ID đơn hàng/đơn hàng của quán hợp lệ" });
        }
        if (shopOrder.deliveryOtp != otp) {
            return res.status(400).json({ message: "Mã OTP không hợp lệ" });
        }

        shopOrder.status = "delivered";
        shopOrder.payment = true;
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

        return res.status(200).json({ message: "Đơn hàng đã được giao thành công" });
    } catch (error) {
        return res.status(500).json({ message: `Xác thực OTP thất bại. Lỗi: ${error.message}` });
    }
}

export const cancelShopOrder = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.params;
        const userId = req.userId;

        // Find order and verify ownership
        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        // Find the specific shopOrder
        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!shopOrder) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng của quán" });
        }

        // Check if order can be cancelled
        if (shopOrder.status === 'delivered') {
            return res.status(400).json({ message: "Không thể hủy đơn hàng đã giao" });
        }
        if (shopOrder.status === 'out of delivery') {
            return res.status(400).json({ message: "Không thể hủy đơn hàng đang giao" });
        }
        if (shopOrder.status === 'cancelled') {
            return res.status(400).json({ message: "Đơn hàng đã được hủy trước đó" });
        }

        // Update status to cancelled
        shopOrder.status = 'cancelled';
        const { reason } = req.body;
        if (reason) {
            shopOrder.cancelReason = reason;
        }
        await order.save();

        // Emit socket event for real-time update
        // Emit socket event for real-time update
        const io = req.app.get("io");

        // Notify User: Fetch user to get current socketId
        const user = await User.findById(userId);
        if (user && user.socketId) {
            io.to(user.socketId).emit("statusUpdate", {
                orderId,
                shopOrderId,
                shopId: shopOrder.shop,
                status: 'cancelled',
                reason: shopOrder.cancelReason
            });
        }

        // Notify Shop Owner: Fetch owner to get socketId
        const shop = await Shop.findById(shopOrder.shop);
        if (shop && shop.owner) {
            const owner = await User.findById(shop.owner);
            if (owner && owner.socketId) {
                io.to(owner.socketId).emit("statusUpdate", {
                    orderId,
                    shopOrderId,
                    shopId: shopOrder.shop,
                    status: 'cancelled',
                    reason: shopOrder.cancelReason
                });
            }
        }

        return res.status(200).json({
            message: "Đã hủy đơn hàng thành công",
            shopOrder
        });
    } catch (error) {
        return res.status(500).json({ message: `Hủy đơn hàng thất bại. Lỗi: ${error.message}` });
    }
}

export const getDeliveredOrders = async (req, res) => {
    try {
        const userId = req.userId;

        // Find orders where any shopOrder is assigned to this delivery person and status is 'delivered'
        const orders = await Order.find({
            "shopOrders": {
                $elemMatch: {
                    assignedDeliveryPerson: userId,
                    status: "delivered"
                }
            }
        })
            .populate("shopOrders.shop")
            .populate("shopOrders.assignedDeliveryPerson")
            .populate("user")
            .sort({ createdAt: -1 });

        // Filter and map to structure similar to available orders
        const deliveredOrders = [];

        orders.forEach(order => {
            order.shopOrders.forEach(shopOrder => {
                if (shopOrder.assignedDeliveryPerson?._id.toString() === userId && shopOrder.status === 'delivered') {
                    deliveredOrders.push({
                        orderId: order._id,
                        shopOrderId: shopOrder._id,
                        shop: shopOrder.shop,
                        user: order.user,
                        deliveryAddress: order.deliveryAddress,
                        items: shopOrder.shopOrderItems,
                        subTotal: shopOrder.subTotal,
                        deliveryFee: shopOrder.deliveryFee,
                        createdAt: order.createdAt,
                        deliveryAt: shopOrder.deliveryAt,
                        status: shopOrder.status
                    });
                }
            });
        });

        return res.status(200).json(deliveredOrders);
    } catch (error) {
        return res.status(500).json({ message: `Lấy đơn hàng đã giao thất bại. Lỗi: ${error.message}` });
    }
}