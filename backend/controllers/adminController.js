import User from '../models/userModel.js';
import Shop from '../models/shopModel.js';
import Order from '../models/orderModel.js';

// Dashboard Statistics
export const getDashboardStats = async (req, res) => {
    try {
        // Count users by role
        const totalCustomers = await User.countDocuments({ role: "user" });
        const totalOwners = await User.countDocuments({ role: "owner" });
        const totalDelivery = await User.countDocuments({ role: "delivery" });

        // Total users = all non-admin users
        const totalUsers = totalCustomers + totalOwners + totalDelivery;

        const totalShops = await Shop.countDocuments();
        const totalOrders = await Order.countDocuments();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const ordersToday = await Order.countDocuments({ createdAt: { $gte: today } });

        const thisWeekStart = new Date();
        thisWeekStart.setDate(thisWeekStart.getDate() - 7);
        const ordersThisWeek = await Order.countDocuments({ createdAt: { $gte: thisWeekStart } });

        const thisMonthStart = new Date();
        thisMonthStart.setDate(1);
        thisMonthStart.setHours(0, 0, 0, 0);
        const ordersThisMonth = await Order.countDocuments({ createdAt: { $gte: thisMonthStart } });

        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        return res.status(200).json({
            users: {
                total: totalUsers,
                customers: totalCustomers,
                owners: totalOwners,
                delivery: totalDelivery
            },
            shops: totalShops,
            orders: { total: totalOrders, today: ordersToday, thisWeek: ordersThisWeek, thisMonth: ordersThisMonth },
            revenue: totalRevenue[0]?.total || 0
        });
    } catch (error) {
        return res.status(500).json({ message: `Lấy thống kê thất bại. Lỗi: ${error.message}` });
    }
}

// User Management
export const getAllUsers = async (req, res) => {
    try {
        const { role, status, search } = req.query;
        const query = {};

        if (role) query.role = role;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: `Lấy danh sách người dùng thất bại. Lỗi: ${error.message}` });
    }
}

export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Lấy thông tin người dùng thất bại. Lỗi: ${error.message}` });
    }
}

export const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!['active', 'banned'].includes(status)) {
            return res.status(400).json({ message: "Trạng thái không hợp lệ" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { status },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Cập nhật trạng thái người dùng thất bại. Lỗi: ${error.message}` });
    }
}

export const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['user', 'owner', 'delivery', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Vai trò không hợp lệ" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Cập nhật vai trò người dùng thất bại. Lỗi: ${error.message}` });
    }
}

// Shop Management
export const getAllShops = async (req, res) => {
    try {
        const { status, search } = req.query;
        const query = {};

        if (status) query.status = status;
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const shops = await Shop.find(query)
            .populate('owner', 'fullName email')
            .sort({ createdAt: -1 });

        return res.status(200).json(shops);
    } catch (error) {
        return res.status(500).json({ message: `Lấy danh sách quán ăn thất bại. Lỗi: ${error.message}` });
    }
}

export const updateShopStatus = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { status } = req.body;

        if (!['active', 'disabled', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: "Trạng thái không hợp lệ" });
        }

        const shop = await Shop.findByIdAndUpdate(
            shopId,
            { status },
            { new: true }
        ).populate('owner', 'fullName email');

        if (!shop) {
            return res.status(404).json({ message: "Không tìm thấy quán ăn" });
        }

        return res.status(200).json(shop);
    } catch (error) {
        return res.status(500).json({ message: `Cập nhật trạng thái quán ăn thất bại. Lỗi: ${error.message}` });
    }
}

// Order Management
export const getAllOrders = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        const query = {};

        if (status) query["shopOrders.status"] = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const orders = await Order.find(query)
            .populate('user', 'fullName email mobile')
            .populate('shopOrders.shop', 'name')
            .sort({ createdAt: -1 })
            .limit(100);

        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ message: `Lấy danh sách đơn hàng thất bại. Lỗi: ${error.message}` });
    }
}
