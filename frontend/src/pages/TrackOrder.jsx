import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../App";
import { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import DeliveryPersonTracking from "../components/DeliveryPersonTracking";

import { useSelector, useDispatch } from "react-redux";
import { assignDeliveryPerson, updateUserOrderStatus } from "../redux/userSlice";

function TrackOrder() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [currentOrder, setCurrentOrder] = useState();
    const { socket } = useSelector(state => state.user);
    const dispatch = useDispatch();

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

    useEffect(() => {
        if (!socket || !currentOrder) return;

        socket.on("deliveryAssigned", (data) => {
            if (data.orderId === orderId) {
                // Update local state
                setCurrentOrder(prev => {
                    const updatedShopOrders = prev.shopOrders.map(so => {
                        if (so._id === data.shopOrderId) {
                            return {
                                ...so,
                                assignedDeliveryPerson: data.deliveryPerson,
                                status: data.status
                            }
                        }
                        return so;
                    })
                    return { ...prev, shopOrders: updatedShopOrders };
                })
                // Update Redux state
                dispatch(assignDeliveryPerson(data));
            }
        })

        socket.on("statusUpdate", (data) => {
            if (data.orderId === orderId) {
                // Update local state
                setCurrentOrder(prev => {
                    const updatedShopOrders = prev.shopOrders.map(so => {
                        // data.shopId might be string or object
                        if (so.shop._id === data.shopId || so.shop === data.shopId) {
                            return { ...so, status: data.status };
                        }
                        return so;
                    })
                    return { ...prev, shopOrders: updatedShopOrders };
                })
                // Update Redux state
                dispatch(updateUserOrderStatus(data));
            }
        })

        return () => {
            socket.off("deliveryAssigned");
            socket.off("statusUpdate");
        }
    }, [socket, orderId, currentOrder, dispatch])

    return (
        <div className="min-h-screen bg-[#fff9f6] py-6">
            <div className="max-w-4xl mx-auto px-4 flex flex-col gap-6">
                <div className='flex items-center gap-4 mb-6 cursor-pointer group w-fit' onClick={() => navigate("/my-orders")}>
                    <div className="p-2 bg-white rounded-full shadow-sm text-[#ff4d2d] group-hover:bg-[#ff4d2d] group-hover:text-white transition-all">
                        <IoArrowBack size={24} />
                    </div>
                    <h1 className='text-2xl font-bold text-gray-800'>Theo dõi đơn hàng</h1>
                </div>

                {/* Delivery Address - Show once for entire order */}
                {currentOrder?.deliveryAddress && (
                    <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
                        <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <span className="text-[#ff4d2d]">📍</span> Địa chỉ giao hàng
                        </p>
                        <p className="text-gray-700 font-medium">{currentOrder.deliveryAddress.address}</p>
                        {currentOrder.deliveryAddress.city && currentOrder.deliveryAddress.state && (
                            <p className="text-gray-500 text-sm mt-1">
                                {currentOrder.deliveryAddress.city}, {currentOrder.deliveryAddress.state}
                            </p>
                        )}
                    </div>
                )}

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
                                    <span className="text-[#ff4d2d] font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shopOrder.subTotal + shopOrder.deliveryFee)}</span>
                                </p>
                            </div>
                        </div>

                        {/* Status */}
                        {shopOrder.status != "delivered" ? (
                            <div className="space-y-4">
                                <h2 className="text-lg font-bold text-gray-800">Người giao hàng</h2>
                                {shopOrder.assignedDeliveryPerson ? (
                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <p className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-700">Tên:</span>
                                                    <span className="text-gray-800">{shopOrder.assignedDeliveryPerson.fullName}</span>
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-700">SĐT:</span>
                                                    <span className="text-gray-800">{shopOrder.assignedDeliveryPerson.mobile}</span>
                                                </p>
                                            </div>
                                            {shopOrder.deliveryOtp && (
                                                <div className="bg-white px-3 py-2 rounded-lg border border-orange-200 flex flex-col items-center shadow-sm">
                                                    <span className="text-xs text-gray-500 font-medium uppercase">Mã OTP</span>
                                                    <span className="text-xl font-bold text-[#ff4d2d] tracking-widest">{shopOrder.deliveryOtp}</span>
                                                </div>
                                            )}
                                        </div>
                                        {shopOrder.deliveryOtp && (
                                            <p className="text-xs text-gray-500 italic border-t border-orange-200/50 pt-2 mt-2">
                                                * Đọc mã này cho tài xế khi nhận hàng để xác nhận
                                            </p>
                                        )}
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
                                            lat: currentOrder.deliveryAddress.lat,
                                            lon: currentOrder.deliveryAddress.lon
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

export default TrackOrder;
