import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from './../models/shopModel.js';
import Item from './../models/itemModel.js';
import Order from './../models/orderModel.js';

export const createEditShop = async (req, res) => {
    try {
        const { name, city, district, commune, address, hotline, openTime, closeTime, lat, lon } = req.body;

        let image;
        if (req.files && req.files['image']) {
            image = await uploadOnCloudinary(req.files['image'][0].path);
        }

        let businessLicense, foodSafetyLicense, firePreventionLicense;
        if (req.files && req.files['businessLicense']) {
            businessLicense = await uploadOnCloudinary(req.files['businessLicense'][0].path);
        }
        if (req.files && req.files['foodSafetyLicense']) {
            foodSafetyLicense = await uploadOnCloudinary(req.files['foodSafetyLicense'][0].path);
        }
        if (req.files && req.files['firePreventionLicense']) {
            firePreventionLicense = await uploadOnCloudinary(req.files['firePreventionLicense'][0].path);
        }

        let shop = await Shop.findOne({ owner: req.userId });
        if (!shop) {
            shop = await Shop.create({
                name, city, district, commune, address, lat, lon, hotline, openTime, closeTime,
                image,
                businessLicense, foodSafetyLicense, firePreventionLicense,
                owner: req.userId,
                status: "pending" // Default to pending
            });
        }
        else {
            const updateData = { name, city, district, commune, address, lat, lon, hotline, openTime, closeTime };
            if (image) updateData.image = image;
            if (businessLicense) updateData.businessLicense = businessLicense;
            if (foodSafetyLicense) updateData.foodSafetyLicense = foodSafetyLicense;
            if (firePreventionLicense) updateData.firePreventionLicense = firePreventionLicense;

            // If updating critical info/licenses, reset to pending? User didn't explicitly ask, but it's safe.
            // keeping status update manual for now unless user asks.

            shop = await Shop.findByIdAndUpdate(shop._id, updateData, { new: true });
        }
        await shop.populate("owner");
        return res.status(201).json(shop);
    } catch (error) {
        return res.status(500).json({ message: `Tạo/Chỉnh sửa quán ăn thất bại. Lỗi: ${error.message}` });
    }
};

export const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId }).populate("owner");
        if (!shop) {
            return null;
        }

        // Fetch items for this shop
        const items = await Item.find({ shop: shop._id })
            .populate("category", "name")
            .sort({ updatedAt: -1 });

        // Return shop with items
        return res.status(200).json({
            _id: shop._id,
            name: shop.name,
            image: shop.image,
            owner: shop.owner,
            city: shop.city,
            district: shop.district,
            commune: shop.commune,
            address: shop.address,
            lat: shop.lat,
            lon: shop.lon,
            hotline: shop.hotline,
            openTime: shop.openTime,
            closeTime: shop.closeTime,
            status: shop.status,
            createdAt: shop.createdAt,
            updatedAt: shop.updatedAt,
            ratings: shop.ratings,
            businessLicense: shop.businessLicense,
            foodSafetyLicense: shop.foodSafetyLicense,
            firePreventionLicense: shop.firePreventionLicense,
            items: items
        });
    } catch (error) {
        return res.status(500).json({ message: `Lấy thông tin quán ăn thất bại. Lỗi: ${error.message}` });
    }
};

export const getShopByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        });
        if (!shops) {
            return res.status(404).json({ message: "Không tìm thấy quán ăn" });
        }
        return res.status(200).json(shops);
    } catch (error) {
        return res.status(500).json({ message: `Lấy quán ăn theo thành phố thất bại. Lỗi: ${error.message}` });
    }
}

export const getShopStats = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId });
        if (!shop) {
            return res.status(404).json({ message: "Không tìm thấy quán ăn" });
        }

        // Aggregate stats
        const stats = await Order.aggregate([
            { $unwind: "$shopOrders" },
            { $match: { "shopOrders.shop": shop._id } },
            {
                $facet: {
                    overall: [
                        {
                            $group: {
                                _id: null,
                                totalOrders: { $sum: 1 },
                                cancelledOrders: {
                                    $sum: { $cond: [{ $eq: ["$shopOrders.status", "cancelled"] }, 1, 0] }
                                },
                                successfulOrders: {
                                    $sum: { $cond: [{ $eq: ["$shopOrders.status", "delivered"] }, 1, 0] }
                                },
                                // Revenue: Sum subTotal where payment is TRUE
                                totalRevenue: {
                                    $sum: { $cond: [{ $eq: ["$shopOrders.payment", true] }, "$shopOrders.subTotal", 0] }
                                }
                            }
                        }
                    ],
                    revenueChart: [
                        {
                            $match: { "shopOrders.payment": true }
                        },
                        {
                            $group: {
                                _id: { $dateToString: { format: "%Y-%m-%d", date: "$shopOrders.createdAt" } },
                                revenue: { $sum: "$shopOrders.subTotal" },
                                orders: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: 1 } },
                        { $limit: 30 }
                    ],
                    statusChart: [
                        {
                            $group: {
                                _id: "$shopOrders.status",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    topItems: [
                        { $unwind: "$shopOrders.shopOrderItems" },
                        {
                            $group: {
                                _id: "$shopOrders.shopOrderItems.item",
                                name: { $first: "$shopOrders.shopOrderItems.name" },
                                soldCount: { $sum: "$shopOrders.shopOrderItems.quantity" },
                                revenue: { $sum: { $multiply: ["$shopOrders.shopOrderItems.price", "$shopOrders.shopOrderItems.quantity"] } }
                            }
                        },
                        { $sort: { soldCount: -1 } },
                        { $limit: 5 },
                        {
                            $lookup: {
                                from: "items",
                                localField: "_id",
                                foreignField: "_id",
                                as: "itemDetails"
                            }
                        },
                        { $unwind: { path: "$itemDetails", preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                name: 1,
                                soldCount: 1,
                                revenue: 1,
                                image: "$itemDetails.image"
                            }
                        }
                    ]
                }
            }
        ]);

        const result = stats[0];
        const overallStats = result.overall[0] || { totalOrders: 0, cancelledOrders: 0, successfulOrders: 0, totalRevenue: 0 };

        return res.status(200).json({
            overallStats,
            revenueChart: result.revenueChart,
            statusChart: result.statusChart,
            topItems: result.topItems
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: `Lấy thống kê thất bại. Lỗi: ${error.message}` });
    }
}