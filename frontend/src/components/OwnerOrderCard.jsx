import axios from "axios";
import { MdPhone } from "react-icons/md";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { updateOwnerOrderStatus } from "../redux/userSlice";
import { useState } from "react";

function OwnerOrderCard({ data }) {
  const [availableDeliveryPerson, setAvailableDeliveryPerson] = useState([]);
  const dispatch = useDispatch();
  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/update-status/${orderId}/${shopId}`, { status }, { withCredentials: true });
      console.log(result.data);
      dispatch(updateOwnerOrderStatus({ orderId, shopId, status }));
      setAvailableDeliveryPerson(result.data.availableDeliveryPerson);
      console.log(result.data);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className='bg-white rounded-2xl shadow-md p-5 space-y-5 border border-gray-100'>
      <div className="flex justify-between items-start border-b border-gray-100 pb-3">
        <div>
          <h2 className='text-lg font-bold text-gray-800'>{data.user.fullName}</h2>
          <div className="flex flex-col gap-1 mt-1">
            <p className='text-sm text-gray-500 flex items-center gap-2'><span className="w-4 h-4 flex items-center justify-center bg-gray-100 rounded-full text-xs">@</span> {data.user.email}</p>
            <p className="text-sm text-gray-500 flex items-center gap-2"><MdPhone className="text-gray-400" /> {data.user.mobile}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${data.shopOrders.payment ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {data.paymentMethod === "online" ? (data.shopOrders.payment ? "Đã thanh toán" : "Chưa thanh toán") : "COD"}
          </div>
          <p className="text-xs text-gray-400 mt-1">{data.paymentMethod === "online" ? "Online Payment" : "Cash on Delivery"}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 flex items-start gap-2 border border-gray-100">
        <div className="mt-0.5 text-[#ff4d2d]">📍</div>
        <p>{data.deliveryAddress?.address}</p>
      </div>

      <div className='flex space-x-3 overflow-x-auto pb-2 scrollbar-hide'>
        {data.shopOrders.shopOrderItems.map((item, index) => (
          <div className='flex-shrink-0 w-32 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden' key={index}>
            <div className="h-24 w-full overflow-hidden">
              <img src={item.item.image} alt="" className='w-full h-full object-cover' />
            </div>
            <div className="p-2">
              <p className='text-sm font-semibold text-gray-800 truncate'>{item.name}</p>
              <p className='text-xs text-gray-500 mt-1'>{item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</p>
              {item.note && <p className="text-[10px] text-orange-500 mt-1 italic line-clamp-2">" {item.note} "</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Trạng thái:</span>
          <span className="font-bold text-[#ff4d2d] capitalize bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 text-sm">
            {data.shopOrders.status}
          </span>
        </div>
        <select
          className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] bg-white shadow-sm transition-all cursor-pointer hover:border-gray-300"
          onChange={(e) => handleUpdateStatus(data._id, data.shopOrders.shop._id, e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Cập nhật trạng thái</option>
          <option value="pending">Đang chờ</option>
          <option value="preparing">Đang chuẩn bị</option>
          <option value="out of delivery">Đang giao</option>
        </select>
      </div>

      {data.shopOrders.status == "out of delivery" &&
        <div className="mt-3 p-3 border border-orange-100 rounded-xl text-sm bg-orange-50/50">
          <p className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            🛵 Người giao hàng
            {data.shopOrders.assignedDeliveryPerson ? <span className="text-green-600 text-xs font-normal bg-green-100 px-2 py-0.5 rounded-full">Đã nhận đơn</span> : <span className="text-yellow-600 text-xs font-normal bg-yellow-100 px-2 py-0.5 rounded-full">Đang tìm...</span>}
          </p>

          {availableDeliveryPerson?.length > 0 ? (
            <div className="space-y-2">
              {availableDeliveryPerson.map((p, index) => (
                <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-orange-100 shadow-sm" key={index}>
                  <span className="font-medium text-gray-700">{p.fullName}</span>
                  <span className="text-gray-500 text-xs">{p.mobile}</span>
                </div>
              ))}
            </div>
          )
            : data.shopOrders.assignedDeliveryPerson
              ? <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-orange-100 shadow-sm">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">👤</div>
                <div>
                  <p className="font-medium text-gray-800">{data.shopOrders.assignedDeliveryPerson.fullName}</p>
                  <p className="text-xs text-gray-500">{data.shopOrders.assignedDeliveryPerson.mobile}</p>
                </div>
              </div>
              : <div className="text-gray-500 italic text-center py-2">Đang chờ tài xế nhận đơn...</div>}
        </div>}

      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-500">Tổng tiền đơn hàng</span>
        <span className="font-bold text-lg text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.shopOrders.subTotal)}</span>
      </div>
    </div>
  )
}

export default OwnerOrderCard
