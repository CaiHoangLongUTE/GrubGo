import axios from "axios";
import { MdPhone } from "react-icons/md";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { updateOwnerOrderStatus } from "../redux/userSlice";
import { useState } from "react";
import { translateOrderStatus, getStatusColor } from "../utils/statusTranslator";

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
    <div className='bg-white rounded-2xl shadow-md p-5 border border-gray-100'>
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
        <div className="flex-1">
          <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
            {data.user.fullName}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal border ${data.shopOrders.payment ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
              }`}>
              {data.paymentMethod === "online" ? (data.shopOrders.payment ? "Đã thanh toán" : "Chưa thanh toán") : "COD"}
            </span>
          </h2>
          <div className="flex flex-col gap-1 mt-2">
            <p className='text-xs text-gray-500 flex items-center gap-1.5'><span className="text-gray-400">@</span> {data.user.email}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1.5"><MdPhone className="text-gray-400" /> {data.user.mobile}</p>
          </div>
        </div>

        <div className="w-full md:w-auto">
          <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-600 flex items-start gap-2 border border-gray-100 max-w-md">
            <div className="mt-0.5 text-[#ff4d2d] flex-shrink-0">📍</div>
            <p className="line-clamp-2">{data.deliveryAddress?.address} - {data.deliveryAddress?.state} - {data.deliveryAddress?.city}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
        {/* Left Side: Items */}
        <div className='flex flex-wrap gap-3 content-start'>
          {data.shopOrders.shopOrderItems.map((item, index) => (
            <div className='flex-shrink-0 w-28 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden' key={index}>
              <div className="h-20 w-full overflow-hidden">
                <img src={item.item.image} alt="" className='w-full h-full object-cover' />
              </div>
              <div className="p-2">
                <p className='text-xs font-semibold text-gray-800 truncate'>{item.name}</p>
                <p className='text-[10px] text-gray-500 mt-0.5'>{item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</p>
                {item.note && <p className="text-[9px] text-orange-500 mt-0.5 italic truncate">" {item.note} "</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Status Control & Totals */}
        <div className="flex flex-col justify-between md:items-end gap-4 min-w-[200px]">
          {/* Status Section */}
          <div className="flex flex-col items-end w-full">
            <div className="flex flex-col items-end gap-2 w-full">
              <div className="flex items-center justify-between w-full md:w-auto gap-3">
                <span className="text-xs text-gray-500">Trạng thái:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm ${getStatusColor(data.shopOrders.status)}`}>
                  {translateOrderStatus(data.shopOrders.status)}
                </span>
              </div>

              {/* Cancel Reason */}
              {data.shopOrders.status === 'cancelled' && data.shopOrders.cancelReason && (
                <div className="group relative flex items-center justify-end">
                  <div className="bg-red-50 text-red-600 px-2.5 py-1 rounded-lg border border-red-100 text-[11px] flex items-center gap-1 shadow-sm max-w-[180px]">
                    <span className="font-semibold flex-shrink-0">Lý do:</span>
                    <span className="truncate">{data.shopOrders.cancelReason}</span>
                  </div>
                  <div className="absolute bottom-full right-0 mb-2 invisible group-hover:visible w-max max-w-[250px] bg-gray-800 text-white text-[10px] p-2 rounded shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {data.shopOrders.cancelReason}
                    <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              )}

              {/* Status Updater */}
              {data.shopOrders.status !== 'delivered' && data.shopOrders.status !== 'cancelled' && (
                <select
                  className="w-auto mt-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] bg-white shadow-sm transition-all cursor-pointer hover:border-gray-300"
                  onChange={(e) => handleUpdateStatus(data._id, data.shopOrders.shop._id, e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>-- Cập nhật trạng thái --</option>
                  <option value="pending">Đang chờ</option>
                  <option value="preparing">Đang chuẩn bị</option>
                  <option value="out of delivery">Đang giao hàng</option>
                </select>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="w-full border-t border-gray-100 pt-3 mt-auto md:text-right">
            <p className="text-xs text-gray-500">Tổng tiền đơn hàng</p>
            <p className="font-bold text-lg text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.shopOrders.subTotal)}</p>
          </div>
        </div>
      </div>

      {data.shopOrders.status == "out of delivery" &&
        <div className="mt-4 p-3 border border-orange-100 rounded-xl text-sm bg-orange-50/50">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-gray-800 flex items-center gap-2 text-xs">
              🛵 Tài xế giao hàng
            </p>
            {data.shopOrders.assignedDeliveryPerson ?
              <span className="text-green-600 text-[10px] font-medium bg-green-100 px-2 py-0.5 rounded-full border border-green-200">Đã nhận đơn</span>
              : <span className="text-yellow-600 text-[10px] font-medium bg-yellow-100 px-2 py-0.5 rounded-full border border-yellow-200">Đang tìm tài xế...</span>
            }
          </div>

          {availableDeliveryPerson?.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {availableDeliveryPerson.map((p, index) => (
                <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-orange-100 shadow-sm" key={index}>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">👤</span>
                    <span className="font-medium text-gray-700 text-xs">{p.fullName}</span>
                  </div>
                  <span className="text-gray-500 text-xs">{p.mobile}</span>
                </div>
              ))}
            </div>
          )
            : data.shopOrders.assignedDeliveryPerson
              ? <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-green-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center border border-green-100">👤</div>
                  <div>
                    <p className="font-bold text-gray-800 text-xs">{data.shopOrders.assignedDeliveryPerson.fullName}</p>
                    <p className="text-[10px] text-gray-500">{data.shopOrders.assignedDeliveryPerson.mobile}</p>
                  </div>
                </div>
                <a href={`tel:${data.shopOrders.assignedDeliveryPerson.mobile}`} className="bg-green-500 text-white p-1.5 rounded-full hover:bg-green-600 shadow-sm">
                  <MdPhone size={14} />
                </a>
              </div>
              : <div className="text-gray-400 italic text-center py-2 text-xs">Hệ thống đang tìm tài xế gần nhất...</div>}
        </div>}

    </div>
  )
}

export default OwnerOrderCard
