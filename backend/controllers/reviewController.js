import Review from '../models/reviewModel.js';
import Order from '../models/orderModel.js';
import Shop from '../models/shopModel.js';
import User from '../models/userModel.js';
import uploadOnCloudinary from '../utils/cloudinary.js';

export const createReview = async (req, res) => {
    try {
        const { orderId, shopOrderId, shopRating, deliveryRating, reviewText } = req.body;
        const userId = req.userId;

        // Verify order exists and belongs to user
        const order = await Order.findById(orderId);
        if (!order || order.user.toString() !== userId) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập" });
        }

        // Get shopOrder details
        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!shopOrder) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng của quán" });
        }

        // Verify order is delivered
        if (shopOrder.status !== "delivered") {
            return res.status(400).json({ message: "Chỉ có thể đánh giá đơn hàng đã được giao" });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({ user: userId, order: orderId });
        if (existingReview) {
            return res.status(400).json({ message: "Bạn đã đánh giá đơn hàng này rồi" });
        }

        // Handle image uploads (max 2)
        let images = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.slice(0, 2).map(file => uploadOnCloudinary(file.path));
            images = await Promise.all(uploadPromises);
        }

        // Create review
        const review = await Review.create({
            order: orderId,
            shopOrder: shopOrderId,
            user: userId,
            shop: shopOrder.shop,
            deliveryPerson: shopOrder.assignedDeliveryPerson,
            shopRating,
            deliveryRating,
            reviewText,
            images
        });

        // Update shop rating
        const shop = await Shop.findById(shopOrder.shop);
        const currentShopRating = shop.ratings?.average || 0;
        const shopRatingCount = shop.ratings?.count || 0;
        const newShopRating = ((currentShopRating * shopRatingCount) + parseInt(shopRating)) / (shopRatingCount + 1);

        await Shop.findByIdAndUpdate(shopOrder.shop, {
            ratings: {
                average: parseFloat(newShopRating.toFixed(1)),
                count: shopRatingCount + 1
            }
        });

        // Update delivery person rating if applicable
        if (shopOrder.assignedDeliveryPerson && deliveryRating) {
            const deliveryPerson = await User.findById(shopOrder.assignedDeliveryPerson);
            const currentDeliveryRating = deliveryPerson.ratings?.average || 0;
            const deliveryRatingCount = deliveryPerson.ratings?.count || 0;

            const newDeliveryRating = ((currentDeliveryRating * deliveryRatingCount) + parseInt(deliveryRating)) / (deliveryRatingCount + 1);

            await User.findByIdAndUpdate(shopOrder.assignedDeliveryPerson, {
                ratings: {
                    average: parseFloat(newDeliveryRating.toFixed(1)),
                    count: deliveryRatingCount + 1
                }
            });
        }

        // Mark shopOrder as reviewed
        await Order.findOneAndUpdate(
            { "_id": orderId, "shopOrders._id": shopOrderId },
            { "$set": { "shopOrders.$.isReviewed": true } }
        );

        // Emit socket event to notify user (real-time update on TrackOrder page)
        const io = req.app.get("io");
        const userRoom = `user_${userId}`;
        io.to(userRoom).emit("reviewSubmitted", {
            orderId,
            shopOrderId,
            isReviewed: true
        });

        await review.populate('user', 'fullName avatar');

        return res.status(201).json(review);
    } catch (error) {
        return res.status(500).json({ message: `Tạo đánh giá thất bại. Lỗi: ${error.message}` });
    }
};

export const getShopReviews = async (req, res) => {
    try {
        const { shopId } = req.params;
        const reviews = await Review.find({ shop: shopId })
            .populate('user', 'fullName avatar')

            .sort({ createdAt: -1 })
            .limit(50);

        return res.status(200).json(reviews);
    } catch (error) {
        return res.status(500).json({ message: `Lấy đánh giá của quán thất bại. Lỗi: ${error.message}` });
    }
};

export const getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.userId })
            .populate('shop', 'name image')
            .populate('deliveryPerson', 'fullName')
            .sort({ createdAt: -1 });

        return res.status(200).json(reviews);
    } catch (error) {
        return res.status(500).json({ message: `Lấy đánh giá của người dùng thất bại. Lỗi: ${error.message}` });
    }
};

export const getDeliveryPersonReviews = async (req, res) => {
    try {
        const { deliveryPersonId } = req.params;
        const reviews = await Review.find({
            deliveryPerson: deliveryPersonId,
            deliveryRating: { $exists: true, $ne: null }
        })
            .populate('user', 'fullName avatar')

            .sort({ createdAt: -1 })
            .limit(50);

        return res.status(200).json(reviews);
    } catch (error) {
        return res.status(500).json({ message: `Lấy đánh giá của nhân viên giao hàng thất bại. Lỗi: ${error.message}` });
    }
};

export const getReviewByShopOrderId = async (req, res) => {
    try {
        const { shopOrderId } = req.params;
        const review = await Review.findOne({ shopOrder: shopOrderId })
            .populate('user', 'fullName avatar')

            .populate('shop', 'name image');

        if (!review) {
            return res.status(404).json({ message: "Không tìm thấy đánh giá" });
        }

        res.status(200).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
};
