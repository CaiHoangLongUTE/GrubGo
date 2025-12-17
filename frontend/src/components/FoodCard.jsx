import React, { useState } from 'react'
import { FaBowlFood } from "react-icons/fa6";
import { RiDrinks2Line } from "react-icons/ri";
import { FaStar } from "react-icons/fa6";
import { FaRegStar } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';

function FoodCard({ data }) {
    const [quantity, setQuantity] = useState(1);
    const dispatch = useDispatch();
    const { cartItems } = useSelector(state => state.user);
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                (i <= rating)
                    ? <FaStar className='text-yellow-500 text-lg' />
                    : <FaRegStar className='text-yellow-500 text-lg' />
            )
        }
        return stars;
    }
    const handleIncrease = () => {
        const newQuantity = quantity + 1;
        setQuantity(newQuantity);
    }
    const handleDecrease = () => {
        if (quantity > 1) {
            const newQuantity = quantity - 1;
            setQuantity(newQuantity);
        }
    }
    return (
        <div className='group w-[250px] rounded-2xl bg-white shadow-md overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col border border-gray-100'>
            <div className='relative w-full h-[170px] flex justify-center items-center bg-gray-50 overflow-hidden'>
                <div className='absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm z-10'>
                    {data.foodType == "food" ? <FaBowlFood className='text-orange-500' size={14} /> : <RiDrinks2Line className='text-blue-500' size={14} />}
                </div>
                <img src={data.image} alt={data.name} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' />
            </div>
            <div className='flex-1 flex flex-col p-4'>
                {/* <h1 className='font-semibold text-gray-900 text-base truncate'>{data.name}</h1>
                <div className='flex items-center gap-1 mt-1'>
                    {renderStars(data.rating?.average || 0)}
                    <span className='text-xs text-gray-500'>
                        {data.rating?.count || 0} Đánh giá
                    </span>
                </div> */
                <p className='font-semibold text-gray-900 text-base truncate'>{data.name}</p>
                }
            </div>
            <div className='flex items-center justify-between mt-auto p-4 border-t border-gray-50'>
                <span className='font-bold text-gray-900 text-lg'>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.price)}
                </span>
                <div className='flex items-center gap-3'>
                    {quantity > 0 && (
                        <div className='flex items-center bg-gray-100 rounded-lg p-1'>
                            <button className='p-1.5 hover:bg-white rounded-md transition-colors text-gray-600' onClick={handleDecrease}>
                                <FaMinus size={10} />
                            </button>
                            <span className='w-6 text-center text-sm font-medium'>{quantity}</span>
                            <button className='p-1.5 hover:bg-white rounded-md transition-colors text-gray-600' onClick={handleIncrease}>
                                <FaPlus size={10} />
                            </button>
                        </div>
                    )}
                    <button
                        className={`${cartItems.some(item => item.id == data._id) ? "bg-gray-800 hover:bg-gray-900" : "bg-[#ff4d2d] hover:bg-[#e03e1f]"} 
                        text-white p-2.5 rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-95`}
                        onClick={() => dispatch(
                            quantity > 0 ? addToCart({
                                id: data._id,
                                name: data.name,
                                price: data.price,
                                image: data.image,
                                shop: data.shop,
                                quantity,
                                foodType: data.foodType,
                            }) : null)}
                    >
                        <FaShoppingCart size={16} />
                    </button>
                </div>
            </div>

        </div>
    )
}

export default FoodCard
