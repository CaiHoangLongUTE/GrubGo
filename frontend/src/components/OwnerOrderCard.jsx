import axios from "axios";
import { MdPhone } from "react-icons/md";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../redux/userSlice";
import { useState } from "react";

function OwnerOrderCard({ data }) {
  const [availableDeliveryPerson, setAvailableDeliveryPerson] = useState([]);
  const dispatch = useDispatch();
  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/update-status/${orderId}/${shopId}`, { status }, { withCredentials: true });
      console.log(result.data);
      dispatch(updateOrderStatus({ orderId, shopId, status }));
      setAvailableDeliveryPerson(result.data.availableDeliveryPerson);
      console.log(result.data);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className='bg-white rounded-lg shadow p-4 space-y-4'>
      <div>
        <h2 className='text-lg font-semibold text-gray-800'>{data.user.fullName}</h2>
        <p className='text-sm text-gray-500'>{data.user.email}</p>
        <p className="flex items-center gap-2 text-sm text-gray-600 mt-1"><MdPhone /><span>{data.user.mobile}</span></p>
        {data.paymentMethod === "online"
          ? <p className="gap-2 text-sm text-gray-600">Thanh toán: {data.payment ? "true" : "false"}</p>
          : <p className="gap-2 text-sm text-gray-600">Phương thức thanh toán: {data.paymentMethod}</p>}
      </div>

      <div className="flex items-start gap-2 text-gray-600 text-sm">
        <p>{data.deliveryAddress?.text}</p>
      </div>

      <div className='flex space-x-4 overflow-x-auto pb-2'>
        {data.shopOrders.shopOrderItems.map((item, index) => (
          <div className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white' key={index}>
            <img src={item.item.image} alt="" className='w-full h-24 object-cover rounded' />
            <p className='text-sm font-semibold mt-1'>{item.name}</p>
            <p className='text-sm text-gray-500'>{item.price} x {item.quantity}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
        <span className="text-sm">Trạng thái: <span className="font-semibold capitalize text-[#ff4d2d]">
          {data.shopOrders.status}</span></span>
        <select className="rounded-md border px-3 py-1 text-sm focus:outline-none 
        focus:ring-2 border-[#ff4d2d]" onChange={(e) => handleUpdateStatus(data._id, data.shopOrders.shop._id, e.target.value)}>
          <option >Change</option>
          <option value="pending">Đang chờ</option>
          <option value="preparing">Đang chuẩn bị</option>
          <option value="out of delivery">Đang giao</option>
        </select>
      </div>

      {data.shopOrders.status == "out of delivery" &&
        <div className="mt-3 p-2 border rounded-lg text-sm bg-orange-50">
          {data.shopOrders.assignedDeliveryPerson ? <p>Người giao hàng</p> :
            <p>Người giao hàng chưa được giao</p>}
          {availableDeliveryPerson?.length > 0 ? (
            availableDeliveryPerson.map((p, index) => (
              <div className="text-gray-800">{p.fullName}-{p.mobile}</div>
            ))
          )
            : data.shopOrders.assignedDeliveryPerson
              ? <div>{data.shopOrders.assignedDeliveryPerson.fullName}-{data.shopOrders.assignedDeliveryPerson.mobile}</div>
              : <div>Đang chờ người giao hàng</div>}
        </div>}
      <div className="text-right font-bold text-gray-800 text-sm">
        Tổng tiền: {data.shopOrders.subTotal}
      </div>
    </div>
  )
}

export default OwnerOrderCard
