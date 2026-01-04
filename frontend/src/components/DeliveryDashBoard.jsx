import { useSelector } from 'react-redux'
import Nav from './Nav'
import axios from 'axios';
import { serverUrl } from '../App';
import { useEffect } from 'react';
import { useState } from 'react';
import DeliveryPersonTracking from './DeliveryPersonTracking';
import { toast } from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';




function DeliveryDashBoard() {
  const { userData, socket } = useSelector(state => state.user);
  const [currentOrder, setCurrentOrder] = useState();
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'delivered'
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [otp, setOtp] = useState("");
  const [isClaimingOrder, setIsClaimingOrder] = useState(false);
  const [revenueStats, setRevenueStats] = useState({ total: 0, today: 0, thisMonth: 0 });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const getRevenueStats = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/order/delivery-revenue`, { withCredentials: true });
      setRevenueStats(data);
    } catch (error) {
      console.error("Failed to fetch revenue stats", error);
    }
  }

  useEffect(() => {
    if (socket) {
      socket.on("newDeliveryAvailable", (newOrder) => {
        setAvailableAssignments(prev => [newOrder, ...prev]);
        toast.success("Có đơn hàng mới!");
      });

      socket.on("deliveryTaken", ({ orderId, shopOrderId }) => {
        setAvailableAssignments(prev => prev.filter(order =>
          !(order.orderId === orderId && order.shopOrderId === shopOrderId)
        ));
      });

      return () => {
        socket.off("newDeliveryAvailable");
        socket.off("deliveryTaken");
      }
    }
  }, [socket]);
  const getAvailableOrders = async () => {
    try {
      console.log("Fetching available orders...");
      const result = await axios.get(`${serverUrl}/api/order/available-orders`, { withCredentials: true });
      console.log("Available orders response:", result.data);
      if (Array.isArray(result.data)) {
        console.log(`Found ${result.data.length} available orders.`);
      } else {
        console.log("Response data is not an array:", result.data);
      }
      setAvailableAssignments(result.data);
    } catch (error) {
      console.error("Error fetching available orders:", error);
    }
  }

  const getDeliveredOrders = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/delivered-orders`, { withCredentials: true });
      setDeliveredOrders(result.data);
    } catch (error) {
      console.log(error);
    }
  }

  const getCurrentOrders = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-current-order`, { withCredentials: true });
      console.log(result.data);
      setCurrentOrder(result.data);
    } catch (error) {
      console.log(error);
      setCurrentOrder(null);
    }
  }

  const claimOrder = async (orderId, shopOrderId) => {
    if (isClaimingOrder) return; // Prevent double-click

    setIsClaimingOrder(true);
    try {
      const result = await axios.post(`${serverUrl}/api/order/claim/${orderId}/${shopOrderId}`, {}, { withCredentials: true });
      console.log(result.data);
      await getCurrentOrders();
      await getAvailableOrders(); // Refresh available orders
      toast.success("Đã nhận đơn hàng thành công!", { duration: 2000 });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Nhận đơn thất bại");
    } finally {
      setIsClaimingOrder(false);
    }
  }

  const verifyOtp = async () => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`, {
        orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id, otp
      }, { withCredentials: true });

      toast.success(result.data.message); // Show success message
      setShowOtpBox(false);
      setOtp("");
      await getCurrentOrders(); // Check if there are more orders or clear current
      await getAvailableOrders(); // Refresh pool
      if (activeTab === 'delivered') getDeliveredOrders(); // Refresh history if valid
      getRevenueStats(); // Refresh revenue stats immediately
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Xác thực thất bại", { duration: 2000 });
    }
  }

  // Refetch data when tab changes or userData updates
  useEffect(() => {
    if (activeTab === 'available') {
      getAvailableOrders();
    } else {
      getDeliveredOrders();
    }
    // We also want to check for current order to ensure state is consistent
    getCurrentOrders();
    getRevenueStats();
  }, [activeTab, userData]);

  console.log("Render Debug:", {
    currentOrder: !!currentOrder,
    availableAssignmentsCount: availableAssignments.length,
    activeTab
  });

  return (
    <div className='w-full min-h-screen bg-[#fff9f9] flex flex-col items-center gap-5 overflow-y-auto pb-10'>
      <Nav />
      <div className='w-full max-w-[800px] flex flex-col gap-5 items-center'>
        <div className='bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100
        text-center gap-2'>
          <h1 className='text-xl font-bold text-[#ff4d2d]'>Xin chào, {userData.fullName}</h1>
          <div className='flex flex-col items-center gap-1'>
            <div className='flex items-center gap-2'>
              <span className='font-bold text-xl text-gray-800'>{userData.ratings?.average?.toFixed(1) || 0}</span>
              <FaStar className="w-5 h-5 text-yellow-400" />
              <span className='text-sm text-gray-500'>({userData.ratings?.count || 0} đánh giá)</span>
            </div>
            <p className='text-xs text-gray-400'>
              <span className='font-semibold'>Vị trí hiện tại: </span>
              {userData.location.coordinates[1].toFixed(4)}, {userData.location.coordinates[0].toFixed(4)}
            </p>
          </div>
        </div>

        {/* Current Order Section */}
        {currentOrder && <div className='bg-white rounded-2xl p-5 shadow:md w-[90%] border border-orange-100'>
          {/* ... Current Order Content ... */}
          {/* (Keeping existing content, just ensuring context) */}
          <h2 className='text-lg font-bold mb-3'>Đơn hàng hiện tại</h2>
          {/* ... code continues ... */}
          <div className='border rounded-lg p-4 mb-3 bg-gray-50'>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className='font-bold text-gray-800 text-lg'>Đơn #{currentOrder._id.slice(-6)}</p>
                <p className='font-bold text-lg text-gray-800'>{currentOrder?.shopOrder.shop.name}</p>
                {currentOrder?.shopOrder?.shop && <p className='text-xs text-gray-500'><span className='font-semibold'>Địa chỉ quán: </span> {currentOrder?.shopOrder?.shop?.address}, {currentOrder?.shopOrder?.shop?.commune}, {currentOrder?.shopOrder?.shop?.district}, {currentOrder?.shopOrder?.shop?.city}</p>}
              </div>
              <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap ml-2">Đang giao</span>
            </div>
            <div className='text-sm text-gray-700 mb-3 p-3 bg-white rounded border border-gray-200'>
              <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                <div>
                  <p className="font-semibold text-gray-800 text-base">{currentOrder?.user?.fullName}</p>
                  <p className="text-gray-500">{currentOrder?.user?.mobile}</p>
                </div>
                <div className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded font-semibold border border-green-100">
                  Khách hàng
                </div>
              </div>
              <p><span className="font-semibold text-gray-800">Giao đến:</span> {currentOrder?.deliveryAddress?.address}, {currentOrder?.deliveryAddress?.commune}, {currentOrder?.deliveryAddress?.district}, {currentOrder?.deliveryAddress?.city}</p>
            </div>

            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Chi tiết đơn hàng:</p>
              <div className="space-y-1">
                {currentOrder.shopOrder.shopOrderItems.map((item, i) => (
                  <div key={i} className="text-sm text-gray-700 flex justify-between">
                    <span>{item.quantity} x {item.name}</span>
                    <span className="text-gray-500">{item.price.toLocaleString()} đ</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between text-sm">
                <span className="font-semibold text-gray-600">Tổng tiền:</span>
                <span className="font-bold text-gray-800">{currentOrder.shopOrder.subTotal?.toLocaleString()} đ</span>
              </div>
              {currentOrder.shopOrder.deliveryFee && (
                <div className="flex justify-between items-center mt-1 text-sm">
                  <span className="font-semibold text-gray-600">Phí giao hàng:</span>
                  <span className="font-bold text-gray-800">{currentOrder.shopOrder.deliveryFee.toLocaleString()} đ</span>
                </div>
              )}
              <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-bold text-sm">
                <span className="text-orange-600">Tổng thu:</span>
                <span className="text-[#ff4d2d]">{(currentOrder.shopOrder.subTotal + (currentOrder.shopOrder.deliveryFee || 0)).toLocaleString()} đ</span>
              </div>
            </div>
          </div>
          <DeliveryPersonTracking data={currentOrder} />
          {!showOtpBox ?
            <button className='mt-4 w-full bg-green-500 text-white font-semibold py-3 px-4 rounded-xl shadow-md
          hover:bg-green-600 active:scale-95 transition-all duration-200 text-lg' onClick={() => setShowOtpBox(true)}>Xác nhận đã giao hàng</button>
            : <div className='mt-4 p-4 border rounded-xl bg-gray-50'>
              <p className='text-sm font-semibold mb-2 text-center text-gray-700'>Nhập mã OTP để hoàn tất đơn hàng
              </p>
              <input type="text" className='w-full border px-4 py-3 rounded-lg mb-3 focus:outline-none focus:ring-2
              focus:ring-orange-400 text-center text-lg tracking-widest' placeholder='Nhập mã OTP' onChange={(e) => setOtp(e.target.value)} value={otp} />
              <button className='w-full bg-orange-500 text-white py-2 rounded-lg font-semibold
              hover:ng-orange-600 transition-all' onClick={verifyOtp}>Xác nhận</button>
            </div>}
        </div>}

        {/* Revenue Stats Section */}
        {!currentOrder && (
          <div className="flex w-[90%] gap-3">
            <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex flex-col items-center">
              <p className="text-xs text-gray-500 font-semibold uppercase">Hôm nay</p>
              <p className="text-lg font-bold text-orange-600">{revenueStats.today?.toLocaleString()} đ</p>
            </div>
            <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex flex-col items-center">
              <p className="text-xs text-gray-500 font-semibold uppercase">Tháng này</p>
              <p className="text-lg font-bold text-blue-600">{revenueStats.thisMonth?.toLocaleString()} đ</p>
            </div>
            <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex flex-col items-center">
              <p className="text-xs text-gray-500 font-semibold uppercase">Tổng cộng</p>
              <p className="text-lg font-bold text-green-600">{revenueStats.total?.toLocaleString()} đ</p>
            </div>
          </div>
        )}

        {/* List Section with Tabs - Only visible if no current order (or always visible? Keeping it simple for now) */}
        {!currentOrder && (
          <div className='bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100'>
            {/* Tabs */}
            <div className="flex w-full mb-4 bg-gray-100 p-1 rounded-xl">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'available' ? 'bg-white text-[#ff4d2d] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('available')}
              >
                Đơn hàng khả dụng
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'delivered' ? 'bg-white text-[#ff4d2d] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('delivered')}
              >
                Lịch sử giao hàng
              </button>
            </div>

            {/* Tab Content */}
            <div className='space-y-4'>
              {activeTab === 'available' ? (
                // Available Orders List
                <div className="flex flex-col gap-3">
                  {availableAssignments.length > 0 ? (
                    availableAssignments.map((a, index) => (
                      <div className='border rounded-lg p-4 flex flex-col gap-3' key={index}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className='font-bold text-gray-800 text-lg'>Đơn #{a.orderId.slice(-6)}</p>
                            <p className='text-lg font-bold text-gray-800'>{a.shop.name}</p>
                            {a.shop?.address && <p className='text-xs text-gray-500 mb-2'><span className='font-semibold'>Địa chỉ quán: </span> {a.shop.address}, {a.shop.commune}, {a.shop.district}, {a.shop.city}</p>}
                            <p className='text-sm text-gray-700 mt-1'><span className='font-semibold'>Giao đến: </span> {a.deliveryAddress.address}, {a.deliveryAddress.commune}, {a.deliveryAddress.district}, {a.deliveryAddress.city}
                            </p>
                          </div>
                          <button
                            className='bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed'
                            onClick={() => claimOrder(a.orderId, a.shopOrderId)}
                            disabled={isClaimingOrder}
                          >
                            {isClaimingOrder ? "Đang xử lý..." : "Nhận đơn"}
                          </button>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Chi tiết đơn hàng:</p>
                          <div className="space-y-1">
                            {a.items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-700">{item.quantity} x {item.name}</span>
                                <span className="text-gray-500">{item.quantity} x {item.price.toLocaleString()} đ</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-600">Tổng tiền:</span>
                            <span className="text-sm font-bold text-gray-800">{a.subTotal?.toLocaleString()} đ</span>
                          </div>
                          <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-600">Phí giao hàng:</span>
                            <span className="text-sm font-bold text-gray-800">{a.deliveryFee?.toLocaleString()} đ</span>
                          </div>
                          <div className="border-t border-gray-200 flex justify-between items-center mt-1">
                            <span className="text-sm font-semibold text-orange-600">Tổng thu:</span>
                            <span className="text-sm font-bold text-orange-600">{(a.subTotal + a.deliveryFee)?.toLocaleString()} đ</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg w-fit">
                          <span className="text-xs font-semibold text-orange-700">Khách hàng:</span>
                          <span className="text-sm font-bold text-gray-800">{a.customer?.name}</span>
                          <span className="text-xs text-gray-500">({a.customer?.mobile})</span>
                        </div>
                      </div>))
                  )
                    : <p className='text-gray-400 text-sm italic text-center py-4'>Hiện chưa có đơn hàng nào...</p>
                  }
                </div>
              ) : (
                // Delivered Orders List with Filter
                <div className="flex flex-col gap-4">
                  {/* Date Filter */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-sm text-gray-600 whitespace-nowrap">Từ ngày:</span>
                      <input
                        type="date"
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-orange-500 w-full"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-sm text-gray-600 whitespace-nowrap">Đến ngày:</span>
                      <input
                        type="date"
                        className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-orange-500 w-full"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    {/* Clear Filter Button - Only show if filters are active */}
                    {(startDate || endDate) &&
                      <button
                        onClick={() => { setStartDate(""); setEndDate(""); }}
                        className="text-sm bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 font-medium px-4 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Xem tất cả
                      </button>}
                  </div>

                  {/* Filtered List */}
                  {deliveredOrders.filter(order => {
                    if (!startDate && !endDate) return true;
                    const orderDate = new Date(order.deliveryAt);
                    orderDate.setHours(0, 0, 0, 0);

                    let start = startDate ? new Date(startDate) : null;
                    if (start) start.setHours(0, 0, 0, 0);

                    let end = endDate ? new Date(endDate) : null;
                    if (end) end.setHours(0, 0, 0, 0);

                    if (start && end) return orderDate >= start && orderDate <= end;
                    if (start) return orderDate >= start;
                    if (end) return orderDate <= end;
                    return true;
                  }).length > 0
                    ? (
                      deliveredOrders
                        .filter(order => {
                          if (!startDate && !endDate) return true;
                          const orderDate = new Date(order.deliveryAt);
                          orderDate.setHours(0, 0, 0, 0);

                          let start = startDate ? new Date(startDate) : null;
                          if (start) start.setHours(0, 0, 0, 0);

                          let end = endDate ? new Date(endDate) : null;
                          if (end) end.setHours(0, 0, 0, 0);

                          if (start && end) return orderDate >= start && orderDate <= end;
                          if (start) return orderDate >= start;
                          if (end) return orderDate <= end;
                          return true;
                        })
                        .map((order, index) => (
                          <div className='border border-green-100 rounded-lg p-4 flex flex-col gap-3 bg-white' key={index}>
                            <div className="flex justify-between items-start">
                              <div>
                                <div className='flex items-center gap-2 mb-1'>
                                  <p className='text-lg font-bold text-[#ff4d2d]'>{order.shop.name}</p>
                                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">HOÀN THÀNH</span>
                                </div>
                                <p className='text-xs text-gray-400 mb-1'>{new Date(order.deliveryAt).toLocaleString('vi-VN')}</p>
                                <p className='text-sm text-gray-600'><span className='font-semibold'>Giao đến:</span> {order.deliveryAddress?.address}, {order.deliveryAddress?.commune}, {order.deliveryAddress?.district}, {order.deliveryAddress?.city}</p>
                              </div>
                            </div>

                            <div className="bg-green-50/50 p-3 rounded-lg border border-green-100">
                              <div className="space-y-1">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-gray-700">{item.quantity} x {item.name}</span>
                                    <span className="text-gray-500">{item.quantity} x {item.price.toLocaleString()} đ</span>
                                  </div>
                                ))}
                              </div>
                              <div className="border-t border-green-200 mt-2 pt-2 flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-600">Tổng thu (gồm ship):</span>
                                <span className="text-sm font-bold text-gray-800">{(order.subTotal + order.deliveryFee)?.toLocaleString()} đ</span>
                              </div>
                            </div>
                          </div>
                        ))
                    )
                    : <p className='text-gray-400 text-sm italic text-center py-4'>Không tìm thấy đơn hàng nào trong khoảng thời gian này...</p>
                  }
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}



export default DeliveryDashBoard
