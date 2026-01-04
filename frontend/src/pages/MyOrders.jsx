import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoArrowBack } from "react-icons/io5";
import { FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import { useEffect, useState } from 'react';
import { setMyOrders, updatePaymentStatus, updateUserOrderStatus, assignDeliveryPerson, updateOwnerOrderStatus } from '../redux/userSlice';

function MyOrders() {
    const { userData, myOrders, socket } = useSelector(state => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('active'); // 'active', 'delivered', 'cancelled'
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        socket?.on("newOrder", (data) => {
            if (data.shopOrders?.owner._id == userData._id) {
                dispatch(setMyOrders([data, ...myOrders]));
            }
        })

        socket?.on("paymentUpdate", (data) => {
            dispatch(updatePaymentStatus(data));
        })

        // Listen for delivery assignment
        socket?.on("deliveryAssigned", (data) => {
            dispatch(assignDeliveryPerson(data));
        })

        // Listen for status updates (for users and owners)
        socket?.on("statusUpdate", (data) => {
            if (userData.role === 'owner') {
                dispatch(updateOwnerOrderStatus(data));
            } else {
                dispatch(updateUserOrderStatus(data));
            }
        })

        return () => {
            socket?.off("newOrder")
            socket?.off("paymentUpdate")
            socket?.off("statusUpdate")
            socket?.off("deliveryAssigned")
        }
    }, [socket, myOrders, userData._id, dispatch, userData.role]);

    // Filter orders based on tab and date
    const filterOrders = (orders) => {
        if (!orders) return [];

        let filtered = [];

        if (userData.role === 'user') {
            filtered = orders.filter(order => {
                const hasActiveOrder = order.shopOrders.some(so => so.status !== 'delivered' && so.status !== 'cancelled');

                if (activeTab === 'active') return hasActiveOrder;
                if (activeTab === 'delivered') return order.shopOrders.every(so => so.status === 'delivered');
                if (activeTab === 'cancelled') return order.shopOrders.some(so => so.status === 'cancelled');
                return false;
            });
        } else if (userData.role === 'owner') {
            filtered = orders.filter(order => {
                if (activeTab === 'active') return order.shopOrders?.status !== 'delivered' && order.shopOrders?.status !== 'cancelled';
                if (activeTab === 'delivered') return order.shopOrders?.status === 'delivered';
                if (activeTab === 'cancelled') return order.shopOrders?.status === 'cancelled';
                return false;
            });
        }

        // Apply date filter for history tabs
        if (activeTab !== 'active' && (startDate || endDate)) {
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.createdAt).setHours(0, 0, 0, 0);
                const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
                const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

                if (start && end) return orderDate >= start && orderDate <= end;
                if (start) return orderDate >= start;
                if (end) return orderDate <= end;
                return true;
            });
        }

        return filtered;
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    const filteredOrders = filterOrders(myOrders);

    return (
        <div className='w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
            <div className='w-full max-w-[800px] p-4'>
                <div className='flex items-center gap-4 mb-6 cursor-pointer group w-fit' onClick={() => navigate("/")}>
                    <div className="p-2 bg-white rounded-full shadow-sm text-[#ff4d2d] group-hover:bg-[#ff4d2d] group-hover:text-white transition-all">
                        <IoArrowBack size={24} />
                    </div>
                    <h1 className='text-2xl font-bold text-gray-800'>Đơn hàng</h1>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${activeTab === 'active'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Đang xử lý
                    </button>
                    <button
                        onClick={() => setActiveTab('delivered')}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${activeTab === 'delivered'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Đã giao
                    </button>
                    <button
                        onClick={() => setActiveTab('cancelled')}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${activeTab === 'cancelled'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Đã hủy
                    </button>
                </div>

                {/* Date Filter Section - Only show for history tabs */}
                {activeTab !== 'active' && (
                    <div className="flex flex-wrap items-end gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-2">
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                />
                                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                                />
                                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-red-50 text-[#ff4d2d] border border-red-100 rounded-lg hover:bg-[#ff4d2d] hover:text-white transition-all font-medium text-sm h-[38px]"
                        >
                            Xem tất cả
                        </button>
                    </div>
                )}

                <div className='space-y-6'>
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order, index) => (
                            userData.role == "user"
                                ?
                                (<UserOrderCard data={order} key={index} />)
                                : userData.role == "owner" ?
                                    (<OwnerOrderCard data={order} key={index} />)
                                    : null
                        ))
                    ) : (
                        <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
                            <p className="text-gray-400 text-lg">
                                {activeTab === 'active'
                                    ? 'Không có đơn hàng đang xử lý'
                                    : activeTab === 'delivered'
                                        ? 'Chưa có đơn hàng đã giao'
                                        : 'Chưa có đơn hàng đã hủy'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    )
}

export default MyOrders
