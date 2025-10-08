import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import { Toaster } from 'react-hot-toast'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useSelector } from 'react-redux'
import Home from './pages/Home'
import useGetCity from './hooks/useGetCity'
import useGetMyShop from './hooks/useGetMyShop'

export const serverUrl = "http://localhost:8000"

const App = () => {
  useGetCurrentUser();
  useGetCity();
  useGetMyShop();
  const { userData } = useSelector((state) => state.user);
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/signin" element={!userData ? <SignIn /> : <Navigate to="/" />} />
        <Route path="/signup" element={!userData ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/forgotpassword" element={!userData ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/" element={userData ? <Home /> : <Navigate to="/signin" />} />
      </Routes>
    </>
  )
}

export default App