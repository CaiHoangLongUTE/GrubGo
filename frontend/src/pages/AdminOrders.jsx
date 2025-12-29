import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import toast from 'react-hot-toast';
import { translateOrderStatus, getStatusColor } from '../utils/statusTranslator';
import { FaEye, FaTimes, FaMapMarkerAlt, FaUser, FaPhone, FaMoneyBillWave, FaBoxOpen, FaMotorcycle } from 'react-icons/fa';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const openDetailModal = (order) => {
        setSelectedOrder(order);
        setIsDetailOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailOpen(false);
        setSelectedOrder(null);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/admin/orders`, { withCredentials: true });
            setOrders(res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Không thể tải orders");
        } finally {
            setLoading(false);
        }
    };



    if (loading) {
        return <div className="p-8"><div className="animate-pulse text-gray-500">Đang tải...</div></div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý đơn hàng</h1>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">#{order._id.slice(-6)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{order.user?.fullName}</div>
                                    <div className="text-sm text-gray-500">{order.user?.mobile}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {order.shopOrders?.map(so => so.shop?.name).join(', ')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{order.totalAmount?.toLocaleString()}₫</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.shopOrders?.[0]?.status)}`}>
                                        {translateOrderStatus(order.shopOrders?.[0]?.status) || 'Chờ xác nhận'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => openDetailModal(order)}
                                        className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2.5 rounded-lg transition-colors shadow-sm hover:shadow"
                                        title="Xem chi tiết"
                                    >
                                        <FaEye className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {orders.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    Chưa có đơn hàng nào
                </div>
            )}

            {/* Order Detail Modal */}
            {isDetailOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 scrollbar-hide">
                        <div className="sticky top-0 bg-white z-20 px-6 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FaBoxOpen className="text-[#ff4d2d]" />
                                Chi tiết đơn hàng #{selectedOrder._id.slice(-6)}
                            </h3>
                            <button onClick={closeDetailModal} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Customer Info */}
                                <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                                        <span className="bg-blue-100 p-2 rounded-lg text-blue-600"><FaUser /></span>
                                        Khách hàng
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <p className="flex justify-between border-b border-blue-100 pb-2"><span className="text-gray-500">Người nhận:</span> <span className="font-semibold text-gray-900">{selectedOrder?.user?.fullName}</span></p>
                                        <p className="flex justify-between border-b border-blue-100 pb-2"><span className="text-gray-500">Số điện thoại:</span> <span className="font-semibold text-gray-900">{selectedOrder?.user?.mobile}</span></p>
                                        <div className="pt-2">
                                            <span className="text-gray-500 flex items-center gap-1 mb-1"><FaMapMarkerAlt className="text-red-500" /> Địa chỉ giao hàng:</span>
                                            <span className="font-medium text-gray-800 block ml-5">{selectedOrder?.deliveryAddress?.address}, {selectedOrder?.deliveryAddress?.commune}, {selectedOrder?.deliveryAddress?.district}, {selectedOrder?.deliveryAddress?.city}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-orange-50/50 p-5 rounded-xl border border-orange-100">
                                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                                        <span className="bg-orange-100 p-2 rounded-lg text-orange-600"><FaMoneyBillWave /></span>
                                        Thanh toán
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <p className="flex justify-between border-b border-orange-100 pb-2"><span className="text-gray-500">Mã đơn:</span> <span className="font-mono bg-white px-2 py-0.5 rounded border border-orange-200 text-orange-800">{selectedOrder._id}</span></p>
                                        <p className="flex justify-between border-b border-orange-100 pb-2"><span className="text-gray-500">Ngày đặt:</span> <span className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</span></p>
                                        <p className="flex justify-between border-b border-orange-100 pb-2"><span className="text-gray-500">Phương thức:</span> <span className="font-bold uppercase bg-white px-2 py-0.5 rounded text-xs border border-gray-200">{selectedOrder.paymentMethod || 'COD'}</span></p>
                                        <p className="flex justify-between items-center pt-2">
                                            <span className="text-gray-500">Trạng thái:</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedOrder.shopOrders?.payment ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {selectedOrder.shopOrders?.payment ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Details per Shop */}
                            <h4 className="font-bold text-gray-800 mb-4 border-l-4 border-[#ff4d2d] pl-3 text-lg flex items-center gap-2">
                                <FaBoxOpen className="text-gray-400" />
                                Chi tiết sản phẩm
                            </h4>
                            <div className="space-y-8">
                                {selectedOrder.shopOrders?.map((shopOrder, idx) => (
                                    <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                                        {/* Shop Header */}
                                        <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                                                    {shopOrder.shop?.image ? (
                                                        <img src={shopOrder.shop.image} alt="" className="w-full h-full object-cover" />
                                                    ) : <FaBoxOpen className="text-gray-300" />}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-gray-800">{shopOrder.shop?.name}</h5>
                                                    <p className="text-xs text-gray-500">{shopOrder.shop?.address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(shopOrder.status)}`}>
                                                    {translateOrderStatus(shopOrder.status)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Driver Info if exists */}
                                        {shopOrder.assignedDeliveryPerson && (
                                            <div className="px-5 py-3 bg-blue-50/30 border-b border-blue-50 flex items-center gap-3 text-sm">
                                                <FaMotorcycle className="text-blue-500" />
                                                <span className="text-gray-600">Tài xế:</span>
                                                <span className="font-bold text-gray-800">{shopOrder.assignedDeliveryPerson.fullName}</span>
                                                <span className="text-gray-400">|</span>
                                                <span className="text-gray-600">{shopOrder.assignedDeliveryPerson.mobile}</span>
                                                {shopOrder.assignedDeliveryPerson.licensePlate && (
                                                    <span className="bg-white border border-gray-200 px-2 rounded text-xs font-mono">{shopOrder.assignedDeliveryPerson.licensePlate}</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Items List */}
                                        <div className="divide-y divide-gray-100">
                                            {shopOrder.shopOrderItems?.map((item, i) => (
                                                <div key={i} className="p-5 flex gap-4 hover:bg-gray-50/50 transition-colors">
                                                    <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 flex-shrink-0">
                                                        <img src={item.item?.image} alt={item.item?.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h6 className="font-semibold text-gray-800">{item.item?.name}</h6>
                                                                {item.note && (
                                                                    <p className="text-sm text-orange-600 italic mt-1 bg-orange-50 inline-block px-2 py-0.5 rounded border border-orange-100">
                                                                        " {item.note} "
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="font-bold text-gray-800">{(item.price * item.quantity).toLocaleString()}₫</span>
                                                                <p className="text-xs text-gray-500">{item.price?.toLocaleString()}₫ x {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Footer Totals */}
                                        <div className="bg-gray-50/50 px-5 py-4 border-t border-gray-200 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Phí giao hàng</span>
                                                <span className="font-medium">{shopOrder.deliveryFee?.toLocaleString() || 0}₫</span>
                                            </div>
                                            <div className="flex justify-between text-base border-t border-gray-200 pt-2">
                                                <span className="font-bold text-gray-700">Tổng cộng</span>
                                                <span className="font-bold text-[#ff4d2d] text-lg">{shopOrder.subTotal?.toLocaleString()}₫</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Grand Total */}
                            <div className="mt-8 flex justify-end">
                                <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl min-w-[300px]">
                                    <div className="flex justify-between items-center mb-2 text-gray-400 text-sm">
                                        <span>Tổng tiền hàng</span>
                                        <span>{(selectedOrder.totalItemsPrice || 0).toLocaleString()}₫</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4 text-gray-400 text-sm">
                                        <span>Tổng phí giao hàng</span>
                                        <span>{(selectedOrder.totalDeliveryFee || 0).toLocaleString()}₫</span>
                                    </div>
                                    <div className="border-t border-gray-700 pt-4 flex justify-between items-end">
                                        <span className="text-lg font-bold">Thành tiền</span>
                                        <span className="text-3xl font-bold text-[#ff4d2d]">{selectedOrder.totalAmount?.toLocaleString()}₫</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end bg-gray-50 sticky bottom-0 z-20">
                            <button
                                onClick={closeDetailModal}
                                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
