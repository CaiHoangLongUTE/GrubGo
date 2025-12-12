import { useSelector } from 'react-redux'
import Nav from './Nav'
import axios from 'axios';
import { serverUrl } from '../App';
import { useEffect } from 'react';
import { useState } from 'react';
import DeliveryPersonTracking from './DeliveryPersonTracking';

function DeliveryDashBoard() {
  const { userData } = useSelector(state => state.user);
  const [currentOrder, setCurrentOrder] = useState();
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [otp, setOtp] = useState("");
  const getAvailableOrders = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/available-orders`, { withCredentials: true });
      setAvailableAssignments(result.data);
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
    try {
      const result = await axios.post(`${serverUrl}/api/order/claim/${orderId}/${shopOrderId}`, {}, { withCredentials: true });
      console.log(result.data);
      await getCurrentOrders();
      await getAvailableOrders(); // Refresh available orders
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to claim order");
    }
  }

  const verifyOtp = async () => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`, {
        orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id, otp
      }, { withCredentials: true });

      alert(result.data.message); // Show success message
      setShowOtpBox(false);
      setOtp("");
      await getCurrentOrders(); // Check if there are more orders or clear current
      await getAvailableOrders(); // Refresh pool
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Verification failed");
    }
  }

  useEffect(() => {
    getAvailableOrders();
    getCurrentOrders();
  }, [userData])
  console.log("currentOrder (debug):", currentOrder);
  return (
    <div className='w-full min-h-screen bg-[#fff9f9] flex flex-col items-center gap-5 overflow-y-auto'>
      <Nav />
      <div className='w-full max-w-[800px] flex flex-col gap-5 items-center'>
        <div className='bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100
        text-center gap-2'>
          <h1 className='text-xl font-bold text-[#ff4d2d]'>Welcome, {userData.fullName}</h1>
          <p className='text-[#ff4d2d]'>
            <span className='font-semibold'>Latitude: </span>{userData.location.coordinates[1]},
            <span className='font-semibold'>Longitude: </span>{userData.location.coordinates[0]}
          </p>
        </div>
        {!currentOrder && <div className=' bg-white rounded-2xl p-5 shadow:md w-[90%] border border-orange-100'>
          <h1 className='text-xl font-bold mb-4 flex items-center gap-2'>Available Assignments</h1>
          <div className='space-y-4'>
            {availableAssignments.length > 0
              ? (
                availableAssignments.map((a, index) => (
                  <div className='border rounded-lg p-4 flex justify-between items-center' key={index}>
                    <div>
                      <p className='text-sm font-semibold'>{a.shopName}</p>
                      <p className='text-sm text-gray-500'><span className='font-semibold'>Delivery Address: </span> {a.deliveryAddress.address}</p>
                      <p className='text-xs text-gray-400'>{a.items.length} items | {a.subTotal} VND</p>
                      {a.deliveryFee && <p className='text-xs text-orange-600 font-semibold'>Delivery Fee: {a.deliveryFee.toLocaleString()} VND</p>}
                    </div>
                    <button className='bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600'
                      onClick={() => claimOrder(a.orderId, a.shopOrderId)}>Accept</button>
                  </div>))
              )
              : <p className='text-gray-400 text-sm'>No available assignments</p>}
          </div>
        </div>}

        {currentOrder && <div className='bg-white rounded-2xl p-5 shadow:md w-[90%] border border-orange-100'>
          <h2 className='text-lg font-bold mb-3'>Current Order</h2>
          <div className='border rounded-lg p-4 mb-3'>
            <p className='font-bold text-sm'>Shop: {currentOrder?.shopOrder.shop.name}</p>
            <p className='text-sm text-gray-500'>{currentOrder?.deliveryAddress.address}</p>
            <p className='text-sx text-gray-400'>{currentOrder.shopOrder.shopOrderItems.length} items | {currentOrder.shopOrder.subTotal} VND</p>
          </div>
          <DeliveryPersonTracking data={currentOrder} />
          {!showOtpBox ?
            <button className='mt-4 w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md
          hover:bg-green-600 active:scale-95 transition-all duration-200' onClick={() => setShowOtpBox(true)}>Mark as delivered</button>
            : <div className='mt-4 p-4 border rounded-xl bg-gray-50'>
              <p className='text-sm font-semibold mb-2'>Enter OTP to confirm delivery
              </p>
              <input type="text" className='w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2
              focus:ring-orange-400'placeholder='Enter OTP' onChange={(e) => setOtp(e.target.value)} value={otp} />
              <button className='w-full bg-orange-500 text-white py-2 rounded-lg font-semibold
              hover:ng-orange-600 transition-all' onClick={verifyOtp}>Submit</button>
            </div>}
        </div>}

      </div>
    </div>
  )
}

export default DeliveryDashBoard
