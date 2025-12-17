import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { FaStore } from "react-icons/fa";
import ReviewForm from './ReviewForm';
import { translateOrderStatus, getStatusColor } from '../utils/statusTranslator';

import { useDispatch } from 'react-redux';
import { updateUserOrderReview } from '../redux/userSlice';

function UserOrderCard({ data }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedShopOrder, setSelectedShopOrder] = useState(null);

  const formateDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  const handleReview = (shopOrder) => {
    setSelectedShopOrder(shopOrder);
    setShowReviewForm(true);
  }

  return (
    <>
      <div className='bg-white rounded-2xl shadow-md p-5 space-y-5 border border-gray-100'>
        <div className='flex justify-between items-center border-b border-gray-100 pb-3'>
          <div>
            <p className='font-bold text-gray-800 text-lg'>Đơn #{data._id.slice(-6)}</p>
            <p className='text-xs text-gray-500 mt-1'>Đặt ngày: {formateDate(data.createdAt)}</p>
          </div>
          <div className='text-right'>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${data.paymentMethod === 'online' && data.shopOrders?.[0]?.payment ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
              {data.paymentMethod === "cod" ? "Thanh toán khi nhận (COD)" : (data.shopOrders?.[0]?.payment ? "Đã thanh toán Online" : "Chưa thanh toán")}
            </span>
          </div>
        </div>

        {data.shopOrders.map((shopOrder, index) => (
          <div className='bg-gray-50 rounded-xl p-4' key={index}>
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#ff4d2d] rounded-lg flex items-center justify-center text-white shadow-sm shadow-orange-200">
                  <FaStore size={16} />
                </div>
                <p className="font-bold text-gray-800 text-base">{shopOrder.shop.name}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm ${getStatusColor(shopOrder.status)}`}>
                  {translateOrderStatus(shopOrder.status)}
                </span>
                {shopOrder.status === 'cancelled' && shopOrder.cancelReason && (
                  <div className="group relative flex items-center justify-end">
                    <div className="bg-red-50 text-red-600 px-2.5 py-1 rounded-lg border border-red-100 text-[11px] flex items-center gap-1 shadow-sm max-w-[180px]">
                      <span className="font-semibold flex-shrink-0">Lý do:</span>
                      <span className="truncate">{shopOrder.cancelReason}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main content grid */}
            <div className='grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3'>
              {/* Items section */}
              <div className='flex flex-wrap gap-2'>
                {shopOrder.shopOrderItems.map((item, index) => (
                  <div className='flex-shrink-0 w-36 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden' key={index}>
                    <div className="h-24 w-full overflow-hidden">
                      <img src={item.item.image} alt="" className='w-full h-full object-cover' />
                    </div>
                    <div className="p-1.5">
                      <p className='text-xs font-semibold text-gray-800 truncate'>{item.name}</p>
                      <p className='text-[10px] text-gray-500'>{item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</p>
                      {item.note && <p className="text-[9px] text-orange-500 italic truncate">" {item.note} "</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing & Action section */}
              <div className='flex flex-col justify-between min-w-[180px] bg-white rounded-lg p-3 border border-gray-100'>
                <div className='space-y-1.5'>
                  <div className='flex justify-between items-center text-xs'>
                    <span className='text-gray-500'>Tiền hàng:</span>
                    <span className="font-medium text-gray-800">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shopOrder.subTotal)}</span>
                  </div>
                  <div className='flex justify-between items-center text-xs'>
                    <span className='text-gray-500'>Phí giao:</span>
                    <span className="font-medium text-gray-800">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shopOrder.deliveryFee || 0)}</span>
                  </div>
                  <div className='border-t border-gray-200 pt-1.5 mt-1.5 flex justify-between items-center'>
                    <span className='text-xs font-semibold text-gray-700'>Tổng:</span>
                    <span className="font-bold text-sm text-[#ff4d2d]">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shopOrder.subTotal + (shopOrder.deliveryFee || 0))}</span>
                  </div>
                </div>

                {shopOrder.status === 'delivered' && (
                  <div className='mt-2'>
                    {!shopOrder.isReviewed ? (
                      <button
                        onClick={() => handleReview(shopOrder)}
                        className='w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors border border-yellow-200'
                      >
                        ⭐ Đánh giá
                      </button>
                    ) : (
                      <button
                        disabled
                        className='w-full bg-gray-100 text-gray-500 px-2 py-1.5 rounded-lg text-xs font-medium border border-gray-200 cursor-not-allowed'
                      >
                        ✨ Đã đánh giá
                      </button>
                    )}
                  </div>
                )}
              </div>
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

      {showReviewForm && selectedShopOrder && (
        <ReviewForm
          orderId={data._id}
          shopOrderId={selectedShopOrder._id}
          shopName={selectedShopOrder.shop.name}
          hasDelivery={!!selectedShopOrder.assignedDeliveryPerson}
          onClose={() => {
            setShowReviewForm(false);
            setSelectedShopOrder(null);
          }}
          onSuccess={() => {
            dispatch(updateUserOrderReview({
              orderId: data._id,
              shopOrderId: selectedShopOrder._id
            }));
          }}
        />
      )}
    </>
  )
}

export default UserOrderCard
