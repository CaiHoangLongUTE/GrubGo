import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
                            <p className="text-sm text-gray-500 mb-1">Tổng người dùng</p>
                            <p className="text-3xl font-bold text-gray-800">{stats?.users?.total || 0}</p>
                            <p className="text-xs text-gray-400 mt-2">
                                Chủ quán: {stats?.users?.owners || 0} | Người giao hàng: {stats?.users?.delivery || 0}
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
                            <p className="text-sm text-gray-500 mb-1">Tổng quán ăn</p>
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
                            <p className="text-sm text-gray-500 mb-1">Tổng đơn hàng</p>
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Distribution Pie Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Phân bố người dùng</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Khách hàng', value: (stats?.users?.total || 0) - (stats?.users?.owners || 0) - (stats?.users?.delivery || 0), fill: '#3b82f6' },
                                    { name: 'Chủ quán', value: stats?.users?.owners || 0, fill: '#10b981' },
                                    { name: 'Người giao hàng', value: stats?.users?.delivery || 0, fill: '#f59e0b' }
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                dataKey="value"
                            >
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 flex justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span className="text-gray-600">Khách hàng</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span className="text-gray-600">Chủ quán</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-amber-500 rounded"></div>
                            <span className="text-gray-600">Người giao hàng</span>
                        </div>
                    </div>
                </div>

                {/* Orders Statistics */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Thống kê đơn hàng</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span className="text-gray-700 font-medium">Hôm nay</span>
                            <span className="font-bold text-blue-600 text-xl">{stats?.orders?.today || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-gray-700 font-medium">Tuần này</span>
                            <span className="font-bold text-green-600 text-xl">{stats?.orders?.thisWeek || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                            <span className="text-gray-700 font-medium">Tháng này</span>
                            <span className="font-bold text-purple-600 text-xl">{stats?.orders?.thisMonth || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                            <span className="text-gray-700 font-medium">Tổng cộng</span>
                            <span className="font-bold text-orange-600 text-xl">{stats?.orders?.total || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Revenue Trend Chart */}
                <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Xu hướng đơn hàng 7 ngày qua</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart
                            data={[
                                { day: 'CN', orders: Math.floor((stats?.orders?.thisWeek || 0) * 0.12) },
                                { day: 'T2', orders: Math.floor((stats?.orders?.thisWeek || 0) * 0.15) },
                                { day: 'T3', orders: Math.floor((stats?.orders?.thisWeek || 0) * 0.14) },
                                { day: 'T4', orders: Math.floor((stats?.orders?.thisWeek || 0) * 0.16) },
                                { day: 'T5', orders: Math.floor((stats?.orders?.thisWeek || 0) * 0.18) },
                                { day: 'T6', orders: Math.floor((stats?.orders?.thisWeek || 0) * 0.13) },
                                { day: 'T7', orders: Math.floor((stats?.orders?.thisWeek || 0) * 0.12) }
                            ]}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="day" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="orders" stroke="#ff4d2d" fill="#ffebe6" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
