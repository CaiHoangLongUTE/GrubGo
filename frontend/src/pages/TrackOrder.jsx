import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../App";
import { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import DeliveryPersonTracking from "../components/DeliveryPersonTracking";

function TrackOrder() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [currentOrder, setCurrentOrder] = useState();
    const handleGetOrder = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true });
            console.log(result.data);
            setCurrentOrder(result.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        handleGetOrder();
    }, [orderId])
    return (
        <div className="min-h-screen bg-[#fff9f6] py-6">
            <div className="max-w-4xl mx-auto px-4 flex flex-col gap-6">
                <div className='flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity'
                    onClick={() => navigate("/my-orders")}>
                    <IoArrowBack size={32} className='text-[#ff4d2d]' />
                    <h1 className="text-2xl font-bold text-gray-800">Theo dõi đơn hàng</h1>
                </div>
                {currentOrder?.shopOrders?.map((shopOrder, index) => (
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-5" key={index}>
                        {/* Shop Info */}
                        <div className="border-b border-gray-100 pb-4">
                            <p className="text-xl font-bold mb-3 text-[#ff4d2d]">{shopOrder.shop.name}</p>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-semibold text-gray-700">Món ăn: </span>
                                    <span className="text-gray-600">{shopOrder.shopOrderItems?.map(i => i.name).join(", ")}</span>
                                </p>
                                <p><span className="font-semibold text-gray-700">Tổng tiền: </span>
                                    <span className="text-[#ff4d2d] font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shopOrder.subTotal)}</span>
                                </p>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <span className="text-[#ff4d2d]">📍</span> Địa chỉ giao hàng
                            </p>
                            <p className="text-gray-600 text-sm">{currentOrder.deliveryAddress.text}</p>
                        </div>

                        {/* Status */}
                        {shopOrder.status != "delivered" ? (
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold text-gray-800">Người giao hàng</h2>
                                {shopOrder.assignedDeliveryPerson ? (
                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 space-y-2">
                                        <p className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700">Tên:</span>
                                            <span className="text-gray-800">{shopOrder.assignedDeliveryPerson.fullName}</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700">SĐT:</span>
                                            <span className="text-gray-800">{shopOrder.assignedDeliveryPerson.mobile}</span>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                                        <p className="text-yellow-800 font-medium text-sm">⏳ Đang tìm người giao hàng...</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                                <p className="text-green-700 font-bold text-lg flex items-center gap-2">
                                    ✅ Đã giao hàng thành công
                                </p>
                            </div>
                        )}

                        {/* Map Tracking */}
                        {shopOrder.assignedDeliveryPerson && shopOrder.status != "delivered" && (
                            <div className="mt-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-3">Theo dõi vị trí</h3>
                                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                    <DeliveryPersonTracking data={{
                                        deliveryPersonLocation: {
                                            lat: shopOrder.assignedDeliveryPerson.location.coordinates[1],
                                            lon: shopOrder.assignedDeliveryPerson.location.coordinates[0]
                                        },
                                        customerLocation: {
                                            lat: currentOrder.deliveryAddress.latitude,
                                            lon: currentOrder.deliveryAddress.longitude
                                        }
                                    }} />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TrackOrder
