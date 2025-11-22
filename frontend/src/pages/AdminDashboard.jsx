import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            console.log('Fetching admin stats...');
            const res = await axios.get(`${serverUrl}/api/admin/stats`, { withCredentials: true });
            console.log('Stats response:', res.data);
            setStats(res.data);
        } catch (error) {
            console.error('Stats fetch error:', error);
            console.error('Error response:', error.response);
            toast.error(error.response?.data?.message || "Không thể tải thống kê");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8"><div className="animate-pulse text-gray-500">Đang tải...</div></div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Users Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Tổng Users</p>
                            <p className="text-3xl font-bold text-gray-800">{stats?.users?.total || 0}</p>
                            <p className="text-xs text-gray-400 mt-2">
                                Owners: {stats?.users?.owners || 0} | Delivery: {stats?.users?.delivery || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Shops Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Tổng Shops</p>
                            <p className="text-3xl font-bold text-gray-800">{stats?.shops || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Total Orders Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Tổng Orders</p>
                            <p className="text-3xl font-bold text-gray-800">{stats?.orders?.total || 0}</p>
                            <p className="text-xs text-gray-400 mt-2">
                                Hôm nay: {stats?.orders?.today || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Revenue Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Doanh thu</p>
                            <p className="text-3xl font-bold text-gray-800">{(stats?.revenue || 0).toLocaleString()}₫</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Thống kê đơn hàng</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Tuần này</span>
                            <span className="font-semibold text-gray-800">{stats?.orders?.thisWeek || 0} đơn</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Tháng này</span>
                            <span className="font-semibold text-gray-800">{stats?.orders?.thisMonth || 0} đơn</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <a href="/admin/users" className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            Xem tất cả users →
                        </a>
                        <a href="/admin/shops" className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            Xem tất cả shops →
                        </a>
                        <a href="/admin/orders" className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            Xem tất cả orders →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
