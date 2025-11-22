import express from 'express';
import isAuth from '../middlewares/isAuth.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import {
    getDashboardStats,
    getAllUsers,
    getUserById,
    updateUserStatus,
    updateUserRole,
    getAllShops,
    updateShopStatus,
    getAllOrders
} from '../controllers/adminController.js';

const Adminrouter = express.Router();

// All routes require authentication + admin role
Adminrouter.use(isAuth);
Adminrouter.use(isAdmin);

// Dashboard
Adminrouter.get('/stats', getDashboardStats);

// User Management
Adminrouter.get('/users', getAllUsers);
Adminrouter.get('/users/:userId', getUserById);
Adminrouter.patch('/users/:userId/status', updateUserStatus);
Adminrouter.patch('/users/:userId/role', updateUserRole);

// Shop Management
Adminrouter.get('/shops', getAllShops);
Adminrouter.patch('/shops/:shopId/status', updateShopStatus);

// Order Management
Adminrouter.get('/orders', getAllOrders);

export default Adminrouter;
