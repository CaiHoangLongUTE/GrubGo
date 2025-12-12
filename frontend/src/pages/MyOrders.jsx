import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import { useEffect } from 'react';
import { setMyOrders, updatePaymentStatus, updateUserOrderStatus } from '../redux/userSlice';

function MyOrders() {
    const { userData, myOrders, socket } = useSelector(state => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        socket?.on("newOrder", (data) => {
            if (data.shopOrders?.owner._id == userData._id) {
                dispatch(setMyOrders([data, ...myOrders]));
            }
        })

        socket?.on("paymentUpdate", (data) => {
            dispatch(updatePaymentStatus(data));
        })

        // Listen for status updates (for users)
        socket?.on("statusUpdate", (data) => {
            dispatch(updateUserOrderStatus(data));
        })

        return () => {
            socket?.off("newOrder")
            socket?.off("paymentUpdate")
            socket?.off("statusUpdate")
        }
    }, [socket, myOrders, userData._id, dispatch]);
    return (
        <div className='w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
            <div className='w-full max-w-[800px] p-4'>
                <div className='flex items-center gap-4 mb-6 cursor-pointer group w-fit' onClick={() => navigate("/")}>
                    <div className="p-2 bg-white rounded-full shadow-sm text-[#ff4d2d] group-hover:bg-[#ff4d2d] group-hover:text-white transition-all">
                        <IoArrowBack size={24} />
                    </div>
                    <h1 className='text-2xl font-bold text-gray-800'>Đơn hàng</h1>
                </div>
                <div className='space-y-6'>
                    {myOrders?.map((order, index) => (
                        userData.role == "user"
                            ?
                            (<UserOrderCard data={order} key={index} />)
                            : userData.role == "owner" ?
                                (<OwnerOrderCard data={order} key={index} />)
                                : null
                    ))}
                </div>
            </div>
        </div >
    )
}

export default MyOrders
