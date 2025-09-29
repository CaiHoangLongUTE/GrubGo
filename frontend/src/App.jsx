import React from 'react'
import { Route, Routes } from 'react-router-dom'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import { Toaster } from 'react-hot-toast'
export const serverUrl="http://localhost:8000"

const App = () => {
  return (
    <>
      <Toaster position="top-center" /> 
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
      </Routes>
    </>  
  )
}

export default App