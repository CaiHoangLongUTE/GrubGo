import React, { useState } from 'react'
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import axios from 'axios';
import toast from 'react-hot-toast';

function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        try {
            const result = await axios.post(`${serverUrl}/api/auth/send-otp`, { email }, { withCredentials: true });
            toast.success("Mã OTP đã được gửi đến email của bạn", { duration: 2000 });
            console.log(result);
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Gửi mã OTP thất bại", { duration: 2000 });
            console.log(error);
        }
    }

    const handleVerifyOtp = async () => {
        try {
            const result = await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp }, { withCredentials: true });
            toast.success("Mã OTP đã được xác nhận", { duration: 2000 });
            console.log(result);
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || "Xác nhận mã OTP thất bại", { duration: 2000 });
            console.log(error);
        }
    }

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            return toast.error("Mật khẩu không khớp", { duration: 2000 });
        }
        try {
            const result = await axios.post(`${serverUrl}/api/auth/reset-password`, { email, newPassword }, { withCredentials: true });
            toast.success("Mật khẩu đã được thay đổi", { duration: 2000 });
            console.log(result);
            navigate('/signin');
        } catch (error) {
            toast.error(error.response?.data?.message || "Thay đổi mật khẩu thất bại", { duration: 2000 });
            console.log(error);
        }
    }

    return (
        <div className='flex items-center justify-center min-h-screen p-4 bg-[#fff9f6]'>
            <div className='bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100'>
                <div className='flex items-center gap-4 mb-6'>
                    <FaArrowLeft size={20} className='text-gray-400 hover:text-[#ff4d2d] cursor-pointer transition-colors' onClick={() => navigate('/signin')} />
                    <h1 className='text-2xl font-extrabold text-gray-900'>Quên mật khẩu?</h1>
                </div>
                {step == 1 && <div>

                    {/*  Email */}
                    <div className='mb-6'>
                        <label htmlFor="email" className='block text-gray-700 font-medium mb-1.5 text-sm'>Email</label>
                        <input type="email" className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] bg-gray-50 transition-all text-sm'
                            placeholder='Nhập email của bạn' onChange={(e) => setEmail(e.target.value)} value={email} required />
                    </div>

                    {/* Send OTP */}
                    <button className='w-full font-bold rounded-xl py-3 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer shadow-lg shadow-orange-200 hover:shadow-orange-300 active:scale-[0.98]'
                        onClick={handleSendOtp}>
                        Gửi mã OTP
                    </button>
                </div>}

                {step == 2 && <div>

                    {/*  OTP */}
                    <div className='mb-6'>
                        <label htmlFor="otp" className='block text-gray-700 font-medium mb-1.5 text-sm'>Mã OTP</label>
                        <input type="number" className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] bg-gray-50 transition-all text-sm'
                            placeholder='Nhập mã OTP' onChange={(e) => setOtp(e.target.value)} value={otp} required />
                    </div>

                    {/* Verify OTP */}
                    <button className='w-full font-bold rounded-xl py-3 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer shadow-lg shadow-orange-200 hover:shadow-orange-300 active:scale-[0.98]'
                        onClick={handleVerifyOtp}>
                        Xác nhận
                    </button>
                </div>}
                {step == 3 && <div>

                    {/*  New Password */}
                    <div className='mb-4 text-left'>
                        <label htmlFor="newPassword" className='block text-gray-700 font-medium mb-1.5 text-sm'>Mật khẩu mới</label>
                        <input type="password" className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] bg-gray-50 transition-all text-sm'
                            placeholder='Nhập mật khẩu mới' onChange={(e) => setNewPassword(e.target.value)} value={newPassword} required />
                    </div>

                    {/* Confirm Password */}
                    <div className='mb-6 text-left'>
                        <label htmlFor="confirmPassword" className='block text-gray-700 font-medium mb-1.5 text-sm'>Xác nhận mật khẩu</label>
                        <input type="password" className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] bg-gray-50 transition-all text-sm'
                            placeholder='Xác nhận mật khẩu mới' onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} required />
                    </div>

                    {/* Reset Password */}
                    <button className='w-full font-bold rounded-xl py-3 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer shadow-lg shadow-orange-200 hover:shadow-orange-300 active:scale-[0.98]'
                        onClick={handleResetPassword}>
                        Đổi mật khẩu
                    </button>
                </div>}
            </div>
        </div>
    )
}

export default ForgotPassword
