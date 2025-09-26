import React, { useState } from 'react'
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import axios from 'axios';

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
            console.log(result);
            setStep(2);
        } catch (error) {
            console.log(error);
        }
    }

    const handleVerifyOtp = async () => {
        try {
            const result = await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp }, { withCredentials: true });
            console.log(result);
            setStep(3);
        } catch (error) {
            console.log(error);
        }
    }

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            return alert("Password and confirm password do not match");
        }
        try {
            const result = await axios.post(`${serverUrl}/api/auth/reset-password`, { email, newPassword }, { withCredentials: true });
            console.log(result);
            navigate('/signin');
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='flex items-center justify-center min-h-screen p-4 bg-[#fff9f6]'>
            <div className='bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px] border-[#ddd]'>
                <div className='flex items-center gap-4'>
                    <FaArrowLeft size={20} className='text-[#ff4d2d] cursor-pointer' onClick={() => navigate('/signin')} />
                    <h1 className='text-2xl font-bold text-center text-[#ff4d2d]'>Forgot Password</h1>
                </div>
                {step == 1 && <div>
                    {/*  Email */}
                    <div className='mb-5 mt-6'>
                        <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>Email</label>
                        <input type="email" className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none'
                            placeholder='Enter your email' onChange={(e) => setEmail(e.target.value)} value={email} />
                    </div>
                    {/* Send OTP */}
                    <button className='w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e72e00] cursor-pointer'
                        onClick={handleSendOtp}>
                        Send OTP
                    </button>
                </div>}

                {step == 2 && <div>
                    {/*  OTP */}
                    <div className='mb-5 mt-6'>
                        <label htmlFor="otp" className='block text-gray-700 font-medium mb-1'>Enter OTP</label>
                        <input type="number" className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none'
                            placeholder='Enter your OTP' onChange={(e) => setOtp(e.target.value)} value={otp} />
                    </div>
                    {/* Verify OTP */}
                    <button className='w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e72e00] cursor-pointer'
                        onClick={handleVerifyOtp}>
                        Verify
                    </button>
                </div>}
                {step == 3 && <div>
                    {/*  New Password */}
                    <div className='mb-5 mt-6'>
                        <label htmlFor="newPassword" className='block text-gray-700 font-medium mb-1'>New Password</label>
                        <input type="password" className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none'
                            placeholder='Enter your new password' onChange={(e) => setNewPassword(e.target.value)} value={newPassword} />
                    </div>
                    {/* Confirm Password */}
                    <div className='mb-5 mt-6'>
                        <label htmlFor="confirmPassword" className='block text-gray-700 font-medium mb-1'>Confirm Password</label>
                        <input type="password" className='w-full border-[1px] border-gray-200 rounded-lg px-3 py-2 focus:outline-none'
                            placeholder='Confirm password' onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} />
                    </div>
                    {/* Reset Password */}
                    <button className='w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e72e00] cursor-pointer'
                        onClick={handleResetPassword}>
                        Reset Password
                    </button>
                </div>}
            </div>
        </div>
    )
}

export default ForgotPassword
