import React from 'react'
import { useNavigate } from 'react-router-dom';
import { FaStore } from "react-icons/fa";

function UserOrderCard({ data }) {
  const navigate = useNavigate();
  const formateDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return (
    <div className='bg-white rounded-2xl shadow-md p-5 space-y-5 border border-gray-100'>
      <div className='flex justify-between items-center border-b border-gray-100 pb-3'>
        <div>
          <p className='font-bold text-gray-800 text-lg'>Order #{data._id.slice(-6)}</p>
          <p className='text-xs text-gray-500 mt-1'>Đặt ngày: {formateDate(data.createdAt)}</p>
        </div>
        <div className='text-right'>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${data.payment ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {data.paymentMethod === "cod" ? "COD" : (data.payment ? "Đã thanh toán" : "Chưa thanh toán")}
          </div>
          <p className='font-semibold text-[#ff4d2d] text-sm mt-1 capitalize'>{data.shopOrders?.[0].status}</p>
        </div>
      </div>

      {data.shopOrders.map((shopOrder, index) => (
        <div className='bg-gray-50 rounded-xl p-4 space-y-3' key={index}>
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="w-8 h-8 bg-[#ff4d2d] rounded-lg flex items-center justify-center text-white shadow-sm shadow-orange-200">
              <FaStore size={16} />
            </div>
            <p className="font-bold text-gray-800 text-base">{shopOrder.shop.name}</p>
          </div>

          <div className='flex space-x-3 overflow-x-auto pb-2 scrollbar-hide'>
            {shopOrder.shopOrderItems.map((item, index) => (
              <div className='flex-shrink-0 w-32 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden' key={index}>
                <div className="h-24 w-full overflow-hidden">
                  <img src={item.item.image} alt="" className='w-full h-full object-cover' />
                </div>
                <div className="p-2">
                  <p className='text-sm font-semibold text-gray-800 truncate'>{item.name}</p>
                  <p className='text-xs text-gray-500 mt-1'>{item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className='flex justify-between items-center pt-2 border-t border-gray-200/50'>
            <p className='text-sm text-gray-500'>Tạm tính: <span className="font-medium text-gray-800">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shopOrder.subTotal)}</span></p>
          </div>
        </div>
      ))}

      <div className='flex justify-between items-center pt-2'>
        <div>
          <p className='text-sm text-gray-500'>Tổng cộng</p>
          <p className='font-bold text-xl text-gray-900'>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.totalAmount)}</p>
        </div>
        <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-5 py-2.5 rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-95 text-sm font-medium'
          onClick={() => navigate(`/track-order/${data._id}`)}>
          Theo dõi đơn hàng
        </button>
      </div>
    </div>
  )
}

export default UserOrderCard
