import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { FaMoneyBillWave, FaShoppingBag, FaCheckCircle, FaTimesCircle, FaChartLine, FaBoxOpen } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { translateOrderStatus } from '../utils/statusTranslator';

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#FF4d2d'];

function ShopRevenue() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get(`${serverUrl}/api/shop/stats`, { withCredentials: true });
                setStats(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                toast.error("Không thể tải thống kê");
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-[#fff9f6]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff4d2d]"></div>
        </div>
    );

    if (!stats) return <div className="text-center mt-10">Không có dữ liệu</div>;

    const { overallStats, revenueChart, statusChart, topItems } = stats;

    return (
        <div className="min-h-screen bg-[#fff9f6] p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <div className='flex items-center gap-4 mb-6 cursor-pointer group w-fit' onClick={() => navigate("/")}>
                        <div className="p-2 bg-white rounded-full shadow-sm text-[#ff4d2d] group-hover:bg-[#ff4d2d] group-hover:text-white transition-all">
                            <IoArrowBack size={24} />
                        </div>
                        <h1 className='text-3xl font-bold text-gray-800'>Thống kê doanh thu</h1>
                    </div>
                    <p className="text-gray-500">Tổng quan về hoạt động kinh doanh của quán</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Tổng doanh thu"
                        value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(overallStats.totalRevenue)}
                        icon={<FaMoneyBillWave className="text-white text-2xl" />}
                        color="bg-gradient-to-r from-green-400 to-green-600"
                    />
                    <StatCard
                        title="Tổng đơn hàng"
                        value={overallStats.totalOrders}
                        icon={<FaShoppingBag className="text-white text-2xl" />}
                        color="bg-gradient-to-r from-blue-400 to-blue-600"
                    />
                    <StatCard
                        title="Đã giao thành công"
                        value={overallStats.successfulOrders}
                        icon={<FaCheckCircle className="text-white text-2xl" />}
                        color="bg-gradient-to-r from-teal-400 to-teal-600"
                    />
                    <StatCard
                        title="Đơn hủy"
                        value={overallStats.cancelledOrders}
                        icon={<FaTimesCircle className="text-white text-2xl" />}
                        color="bg-gradient-to-r from-red-400 to-red-600"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Revenue Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <FaChartLine className="text-[#ff4d2d]" />
                            <h2 className="text-xl font-bold text-gray-800">Doanh thu 30 ngày qua (Đã thanh toán)</h2>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueChart}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff4d2d" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ff4d2d" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="_id"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        tickFormatter={(str) => str.split('-').slice(1).join('/')}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        tickFormatter={(num) => `${(num / 1000000).toFixed(1)}M`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                                        labelFormatter={(label) => `Ngày: ${label}`}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#ff4d2d"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Status Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <FaBoxOpen className="text-blue-500" />
                            <h2 className="text-xl font-bold text-gray-800">Trạng thái đơn hàng</h2>
                        </div>
                        <div className="h-[300px] w-full flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusChart}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="_id"
                                    >
                                        {statusChart.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value, entry) => {
                                            return <span className="text-gray-600 font-medium ml-2">{translateOrderStatus(value)} ({entry.payload.value})</span>
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Top Items */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Món ăn bán chạy nhất</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                    <th className="pb-4 font-medium pl-4">Món ăn</th>
                                    <th className="pb-4 font-medium">Đã bán</th>
                                    <th className="pb-4 font-medium text-right pr-4">Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {topItems.map((item, index) => (
                                    <tr key={index} className="group hover:bg-gray-50 transition-colors">
                                        <td className="py-4 pl-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-semibold text-gray-800">{item.name}</span>
                                        </td>
                                        <td className="py-4 text-gray-600">{item.soldCount}</td>
                                        <td className="py-4 text-right pr-4 font-bold text-[#ff4d2d]">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.revenue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform -rotate-6 ${color}`}>
                {icon}
            </div>
        </div>
    )
}



export default ShopRevenue;