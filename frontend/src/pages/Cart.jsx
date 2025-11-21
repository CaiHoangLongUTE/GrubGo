import React from 'react'
import { IoArrowBack } from "react-icons/io5";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';

function Cart() {
    const navigate = useNavigate();
    const { cartItems, totalAmount } = useSelector(state => state.user);
    return (
        <div className='min-h-screen bg-[#fff9f6] flex justify-center not-first:p-6'>
            <div className='w-full max-w-[800px]'>
                <div className='flex items-center gap-[20px] mb-6'>
                    <div className='z-[10]' onClick={() => navigate("/")}>
                        <IoArrowBack size={36} className='text-[#ff4d2d]' />
                    </div>
                    <h1 className='text-2xl font-bold text-start'>Giỏ hàng của bạn</h1>
                </div>
                {cartItems?.length == 0 ? (
                    <p className='text-gray-500 text-xl text-center'>Giỏ hàng của bạn đang trống. Hãy thêm món ăn vào nhé 😉</p>
                ) : (<>
                    <div className='space-y-4'>
                        {cartItems?.map((item, index) => (
                            <CartItemCard data={item} key={index} />
                        ))}
                    </div>
                    <div className='mt-6 bg-white p-4 rounded-xl shadow flex justify-between items-center border'>
                        <h1 className='text-lg font-semibold'>Tổng tiền</h1>
                        <span className='text-xl font-bold text-[#ff4d2d]'>{totalAmount} ₫</span>
                    </div>
                    <div className='mt-4 flex justify-end'>
                        <button className='bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium 
                        hover:bg-[#e64526] transition' onClick={() => navigate("/checkout")}>Thanh toán</button>
                    </div>
                </>)}
            </div>
        </div>
    )
}

export default Cart
