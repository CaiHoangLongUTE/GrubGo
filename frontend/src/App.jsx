import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignIn from './pages/SignIn'
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import { Toaster } from 'react-hot-toast'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import useGetCity from './hooks/useGetCity'
import useGetMyShop from './hooks/useGetMyShop'
import CreateEditShop from './pages/CreateEditShop'
import AddItem from './pages/AddItem'
import EditItem from './pages/EditItem'
import useGetShopByCity from './hooks/useGetShopByCity'
import useGetItemByCity from './hooks/useGetItemByCity'
import Cart from './pages/Cart'
import CheckOut from './pages/CheckOut'
import OrderPlaced from './pages/OrderPlaced'
import MyOrders from './pages/MyOrders'
import MyProfile from './pages/MyProfile'
import useGetMyOrders from './hooks/useGetMyOrders.jsx'
import useUpdateLocation from './hooks/useUpdateLocation.jsx'
import TrackOrder from './pages/TrackOrder.jsx'
import Shop from './pages/Shop.jsx'
import { io } from 'socket.io-client'
import { setSocket } from './redux/userSlice.js'
import AdminLayout from './components/AdminLayout.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import MyAddresses from './pages/MyAddresses.jsx'
import AddAddress from './pages/AddAddress.jsx'
import UpdateAddress from './pages/UpdateAddress.jsx'
import AdminUsers from './pages/AdminUsers.jsx'
import AdminShops from './pages/AdminShops.jsx'
import AdminOrders from './pages/AdminOrders.jsx'
import AdminCategories from './pages/AdminCategories.jsx'
import useGetCategories from './hooks/useGetCategories.jsx'
import Chatbox from './components/Chatbox.jsx'
import ShopRevenue from './pages/ShopRevenue.jsx'

export const serverUrl = "http://localhost:8000"

function App() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useGetCurrentUser();
  useGetCity();
  useGetCategories();
  useGetMyShop();
  useGetShopByCity();
  useGetItemByCity();
  useGetMyOrders();
  useUpdateLocation();

  useEffect(() => {
    const socketInstance = io(serverUrl, { withCredentials: true });
    dispatch(setSocket(socketInstance));
    socketInstance.on("connect", () => {
      if (userData) {
        socketInstance.emit("identity", { userId: userData._id });
      }
    })
    return () => { socketInstance.disconnect() }
  }, [userData?._id])
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/signin" element={!userData ? <SignIn /> : <Navigate to="/" />} />
        <Route path="/signup" element={!userData ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/forgotpassword" element={!userData ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/" element={userData ? <Home /> : <Landing />} />
        <Route path="/create-edit-shop" element={userData ? <CreateEditShop /> : <Navigate to="/signin" />} />
        <Route path="/add-item" element={userData ? <AddItem /> : <Navigate to="/signin" />} />
        <Route path="/edit-item/:itemId" element={userData ? <EditItem /> : <Navigate to="/signin" />} />
        <Route path="cart" element={userData ? <Cart /> : <Navigate to="/signin" />} />
        <Route path="checkout" element={userData ? <CheckOut /> : <Navigate to="/signin" />} />
        <Route path="order-placed" element={userData ? <OrderPlaced /> : <Navigate to="/signin" />} />
        <Route path="my-orders" element={userData ? <MyOrders /> : <Navigate to="/signin" />} />
        <Route path="my-profile" element={userData ? <MyProfile /> : <Navigate to="/signin" />} />
        <Route path="my-addresses" element={userData ? <MyAddresses /> : <Navigate to="/signin" />} />
        <Route path="add-address" element={userData ? <AddAddress /> : <Navigate to="/signin" />} />
        <Route path="update-address/:id" element={userData ? <UpdateAddress /> : <Navigate to="/signin" />} />
        <Route path="track-order/:orderId" element={userData ? <TrackOrder /> : <Navigate to="/signin" />} />
        <Route path="shop/:shopId" element={userData ? <Shop /> : <Navigate to="/signin" />} />
        <Route path="shop-revenue" element={userData ? <ShopRevenue /> : <Navigate to="/signin" />} />

        {/* Admin Routes */}
        <Route path="/admin" element={userData?.role === "admin" ? <AdminLayout /> : <Navigate to="/" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="shops" element={<AdminShops />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="categories" element={<AdminCategories />} />
        </Route>
      </Routes>

      {/* Chatbox - Show on all pages except admin */}
      {userData?.role == 'user' && <Chatbox />}
    </>
  )
}

export default App