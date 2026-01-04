import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../App";
import { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import { FaStar } from "react-icons/fa";
import DeliveryPersonTracking from "../components/DeliveryPersonTracking";
import ShopOrderReview from "../components/ShopOrderReview";
import CancelOrderModal from "../components/CancelOrderModal";

import { useSelector, useDispatch } from "react-redux";
import { assignDeliveryPerson, updateUserOrderStatus } from "../redux/userSlice";
import toast from "react-hot-toast";

function TrackOrder() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [currentOrder, setCurrentOrder] = useState();
    const { socket } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedShopOrder, setSelectedShopOrder] = useState(null);

    const handleGetOrder = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true });
            console.log(result.data);
            setCurrentOrder(result.data);
        } catch (error) {
            console.log(error);
        }
    }

    const handleCancelOrder = async (shopOrderId, reason) => {
        try {
            const result = await axios.post(`${serverUrl}/api/order/cancel/${orderId}/${shopOrderId}`, { reason }, { withCredentials: true });
            toast.success(result.data.message);
            handleGetOrder(); // Refresh order data
        } catch (error) {
            toast.error(error.response?.data?.message || "Hủy đơn thất bại");
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
                            return {
                                ...so,
                                status: data.status,
                                cancelReason: data.reason // Update cancelReason if present
                            };
                        }
                        return so;
                    })
                    return { ...prev, shopOrders: updatedShopOrders };
                })
                // Update Redux state
                dispatch(updateUserOrderStatus(data));
            }
        })

        socket.on("reviewSubmitted", (data) => {
            if (data.orderId === orderId) {
                // Update local state to reflect review submission
                setCurrentOrder(prev => {
                    const updatedShopOrders = prev.shopOrders.map(so => {
                        if (so._id === data.shopOrderId) {
                            return { ...so, isReviewed: data.isReviewed };
                        }
                        return so;
                    })
                    return { ...prev, shopOrders: updatedShopOrders };
                })
            }
        })

        return () => {
            socket.off("deliveryAssigned");
            socket.off("statusUpdate");
            socket.off("reviewSubmitted");
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
                        {currentOrder.deliveryAddress.city && currentOrder.deliveryAddress.district && (
                            <p className="text-gray-500 text-sm mt-1">
                                {currentOrder.deliveryAddress.commune}, {currentOrder.deliveryAddress.district}, {currentOrder.deliveryAddress.city}
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

                            {/* Cancel Button - Only show for pending/preparing orders */}
                            {(shopOrder.status === 'pending' || shopOrder.status === 'preparing') && (
                                <button
                                    onClick={() => {
                                        setSelectedShopOrder(shopOrder);
                                        setShowCancelModal(true);
                                    }}
                                    className="mt-3 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold text-sm hover:bg-red-100 hover:border-red-300 transition-all"
                                >
                                    Hủy đơn hàng
                                </button>
                            )}
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
                                                    <span className="text-gray-800 flex items-center">
                                                        {shopOrder.assignedDeliveryPerson.fullName}
                                                        <span className="flex items-center ml-1 text-gray-600">
                                                            ({shopOrder.assignedDeliveryPerson.ratings?.average || 0}/5
                                                            <FaStar size={12} className="text-yellow-400 ml-0.5" />)
                                                        </span>
                                                    </span>
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
                        ) : shopOrder.status === 'cancelled' ? (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                                <p className="text-red-700 font-bold text-lg flex items-center gap-2">
                                    ❌ Đã hủy đơn hàng thành công
                                </p>
                                {shopOrder.cancelReason && (
                                    <p className="text-red-600 text-sm mt-1">Lý do: {shopOrder.cancelReason}</p>
                                )}
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                                <p className="text-green-700 font-bold text-lg flex items-center gap-2">
                                    ✅ Đã giao hàng thành công
                                </p>
                                {/*review*/}
                                {shopOrder.isReviewed ? (
                                    <ShopOrderReview shopOrderId={shopOrder._id} />
                                ) : (
                                    <p className="text-green-700 font-bold text-lg flex items-center gap-2">
                                        Nhớ đánh giá đơn hàng, chúc bạn một ngày tốt lành!</p>
                                )}
                            </div>
                        )}

                        {/* Map Tracking */}
                        {shopOrder.assignedDeliveryPerson && shopOrder.status != "delivered" && (
                            <div className="mt-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-3">Theo dõi vị trí</h3>

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
                        )}
                    </div>
                ))}
            </div>

            {/* Cancel Order Modal */}
            <CancelOrderModal
                isOpen={showCancelModal}
                onClose={() => {
                    setShowCancelModal(false);
                    setSelectedShopOrder(null);
                }}
                onConfirm={(reason) => handleCancelOrder(selectedShopOrder?._id, reason)}
                shopName={selectedShopOrder?.shop?.name || ""}
            />
        </div>
    )
}

export default TrackOrder;
