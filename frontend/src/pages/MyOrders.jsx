import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoArrowBack } from "react-icons/io5";
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

    // Filter orders based on tab
    const filterOrders = (orders) => {
        if (!orders) return [];

        if (userData.role === 'user') {
            return orders.filter(order => {
                const hasActiveOrder = order.shopOrders.some(so => so.status !== 'delivered' && so.status !== 'cancelled');

                if (activeTab === 'active') return hasActiveOrder;
                if (activeTab === 'delivered') return order.shopOrders.every(so => so.status === 'delivered');
                if (activeTab === 'cancelled') return order.shopOrders.some(so => so.status === 'cancelled');
                return false;
            });
        } else if (userData.role === 'owner') {
            return orders.filter(order => {
                if (activeTab === 'active') return order.shopOrders?.status !== 'delivered' && order.shopOrders?.status !== 'cancelled';
                if (activeTab === 'delivered') return order.shopOrders?.status === 'delivered';
                if (activeTab === 'cancelled') return order.shopOrders?.status === 'cancelled';
                return false;
            });
        }
        return orders;
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
