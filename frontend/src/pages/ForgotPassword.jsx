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
            <div className='bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px] border-[#ddd]'>
                <div className='flex items-center gap-4'>
                    <FaArrowLeft size={20} className='text-[#ff4d2d] cursor-pointer' onClick={() => navigate('/signin')} />
                    <h1 className='text-2xl font-bold text-center text-[#ff4d2d]'>Quên mật khẩu?</h1>
                </div>
                {step == 1 && <div>
                    {/*  Email */}
                    <div className='mb-5 mt-6'>
                        <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>Email</label>
                        <input type="email" className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none'
                            placeholder='Nhập email' onChange={(e) => setEmail(e.target.value)} value={email} required />
                    </div>
                    {/* Send OTP */}
                    <button className='w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e72e00] cursor-pointer'
                        onClick={handleSendOtp}>
                        Gửi mã OTP
                    </button>
                </div>}

                {step == 2 && <div>
                    {/*  OTP */}
                    <div className='mb-5 mt-6'>
                        <label htmlFor="otp" className='block text-gray-700 font-medium mb-1'>Mã OTP</label>
                        <input type="number" className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none'
                            placeholder='Nhập mã OTP' onChange={(e) => setOtp(e.target.value)} value={otp} required />
                    </div>
                    {/* Verify OTP */}
                    <button className='w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e72e00] cursor-pointer'
                        onClick={handleVerifyOtp}>
                        Xác nhận
                    </button>
                </div>}
                {step == 3 && <div>
                    {/*  New Password */}
                    <div className='mb-5 mt-6'>
                        <label htmlFor="newPassword" className='block text-gray-700 font-medium mb-1'>Mật khẩu mới</label>
                        <input type="password" className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none'
                            placeholder='Nhập mật khẩu mới' onChange={(e) => setNewPassword(e.target.value)} value={newPassword} required />
                    </div>
                    {/* Confirm Password */}
                    <div className='mb-5 mt-6'>
                        <label htmlFor="confirmPassword" className='block text-gray-700 font-medium mb-1'>Xác nhận mật khẩu</label>
                        <input type="password" className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none'
                            placeholder='Xác nhận mật khẩu mới' onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} required />
                    </div>
                    {/* Reset Password */}
                    <button className='w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e72e00] cursor-pointer'
                        onClick={handleResetPassword}>
                        Đổi mật khẩu
                    </button>
                </div>}
            </div>
        </div>
    )
}

export default ForgotPassword
