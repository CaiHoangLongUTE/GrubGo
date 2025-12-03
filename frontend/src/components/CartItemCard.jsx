import React from 'react'
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { removeCartItem, updateQuantity } from '../redux/userSlice';
import { useDispatch } from 'react-redux';

function CartItemCard({ data }) {
  const dispatch = useDispatch();
  const handleIncrease = (id, currentQuantity) => {
    dispatch(updateQuantity({ id: id, quantity: currentQuantity + 1 }));
  }
  const handleDecrease = (id, currentQuantity) => {
    if (currentQuantity > 1) {
      dispatch(updateQuantity({ id: id, quantity: currentQuantity - 1 }));
    }
  }
  return (
    <div className='flex items-center justify-between bg-white p-4 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300'>
      <div className='flex items-center gap-4'>
        <img src={data.image} alt="" className='w-24 h-24 object-cover rounded-xl border border-gray-100' />
        <div>
          <h1 className='font-bold text-gray-800 text-lg'>{data.name}</h1>
          <p className='text-sm text-gray-500 mt-1'>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.price)} x {data.quantity}</p>
          <p className='font-bold text-[#ff4d2d] mt-1'>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.price * data.quantity)}</p>
        </div>
      </div>
      <div className='flex items-center gap-3'>
        <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
          <button className='p-2 hover:bg-white rounded-lg transition-colors text-gray-600'
            onClick={() => handleDecrease(data.id, data.quantity)}>
            <FaMinus size={10} />
          </button>
          <span className="w-8 text-center font-medium text-gray-800">{data.quantity}</span>
          <button className='p-2 hover:bg-white rounded-lg transition-colors text-gray-600'
            onClick={() => handleIncrease(data.id, data.quantity)}>
            <FaPlus size={10} />
          </button>
        </div>
        <button className='p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors ml-2'
          onClick={() => dispatch(removeCartItem(data.id))}>
          <FaRegTrashCan size={16} />
        </button>
      </div>
    </div>
  )
}

export default CartItemCard
