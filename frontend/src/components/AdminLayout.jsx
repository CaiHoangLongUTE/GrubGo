import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { FaUsers, FaStore, FaClipboardList, FaSignOutAlt, FaTags } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import axios from 'axios';
import { serverUrl } from '../App';
import toast from 'react-hot-toast';

const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post(`${serverUrl}/api/auth/signout`);
            dispatch(setUserData(null));
            toast.success("Đăng xuất thành công");
            navigate("/signin");
        } catch (error) {
            console.error("Logout failed", error);
            toast.error("Đăng xuất thất bại");
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:block">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-extrabold text-[#ff4d2d] flex items-center gap-2">
                        <MdDashboard /> Admin
                    </h1>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-[#ff4d2d] text-white shadow-lg shadow-orange-200' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <MdDashboard className="w-5 h-5 mr-3" />
                        Tổng quan
                    </NavLink>
                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-[#ff4d2d] text-white shadow-lg shadow-orange-200' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <FaUsers className="w-5 h-5 mr-3" />
                        Người dùng
                    </NavLink>
                    <NavLink
                        to="/admin/shops"
                        className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-[#ff4d2d] text-white shadow-lg shadow-orange-200' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <FaStore className="w-5 h-5 mr-3" />
                        Cửa hàng
                    </NavLink>
                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-[#ff4d2d] text-white shadow-lg shadow-orange-200' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <FaClipboardList className="w-5 h-5 mr-3" />
                        Đơn hàng
                    </NavLink>
                    <NavLink
                        to="/admin/categories"
                        className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-[#ff4d2d] text-white shadow-lg shadow-orange-200' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <FaTags className="w-5 h-5 mr-3" />
                        Danh mục
                    </NavLink>
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg w-full transition-colors"
                    >
                        <FaSignOutAlt className="w-5 h-5 mr-3" />
                        Đăng xuất
                    </button>
                </div>
            </div>

            {/* Mobile Header (Visible only on small screens) */}


            {/* Main Content */}
            <div className="flex-1 md:ml-64">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
