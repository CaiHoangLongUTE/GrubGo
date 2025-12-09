import React from 'react'
import { useState } from 'react';
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('user');
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    const handleSignUp = async () => {
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signup`, {
                fullName, email, mobile, password, role
            }, { withCredentials: true });
            dispatch(setUserData(result.data));
            toast.success("Đăng ký thành công", { duration: 2000 });
            navigate('/signin');
            console.log(result);
        } catch (error) {
            toast.error(error.response?.data?.message || "Đăng ký thất bại", { duration: 2000 });
            console.log(error);
        }
    }

    const handleGoogleAuth = async () => {
        if (!mobile) {
            return toast.error("Vui lòng nhập số điện thoại trước khi đăng ký với Google", { duration: 2000 });
        }
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        try {
            const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                fullName: result.user.displayName,
                email: result.user.email,
                mobile,
                role
            }, { withCredentials: true });
            dispatch(setUserData(data));
            toast.success("Đăng ký với Google thành công", { duration: 2000 });
            navigate('/signin');
            console.log(data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Đăng ký với Google thất bại", { duration: 2000 });
            console.log(error);
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center p-4 bg-[#fff9f6]'>
            <div className='bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100'>
                <h1 className='text-center text-3xl font-extrabold mb-2 text-[#ff4d2d]'>GrubGo</h1>
                <p className='text-center text-gray-500 mb-8 text-sm'>Đăng ký tài khoản của riêng bạn để tham gia trải nghiệm vị giác của chúng tôi</p>
                {/* Full name */}
                <div className='mb-4'>
                    <label htmlFor="fullName" className='block text-gray-700 font-medium mb-1.5 text-sm'>Họ và tên</label>
                    <input type="text" className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] bg-gray-50 transition-all text-sm'
                        placeholder='Nhập họ tên'
                        onChange={(e) => setFullName(e.target.value)} value={fullName} required />
                </div>
                {/*  Email */}
                <div className='mb-4'>
                    <label htmlFor="email" className='block text-gray-700 font-medium mb-1.5 text-sm'>Email</label>
                    <input type="email" className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] bg-gray-50 transition-all text-sm'
                        placeholder='Nhập email'
                        onChange={(e) => setEmail(e.target.value)} value={email} required />
                </div>
                {/* Mobile */}
                <div className='mb-4'>
                    <label htmlFor="mobile" className='block text-gray-700 font-medium mb-1.5 text-sm'>Số điện thoại</label>
                    <input type="tel" className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] bg-gray-50 transition-all text-sm'
                        placeholder='Nhập số điện thoại'
                        onChange={(e) => setMobile(e.target.value)} value={mobile} required />
                </div>
                {/* Password */}
                <div className='mb-4'>
                    <label htmlFor="password" className='block text-gray-700 font-medium mb-1.5 text-sm'>Mật khẩu</label>
                    <div className='relative'>
                        <input type={`${showPassword ? 'text' : 'password'}`} className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] bg-gray-50 transition-all text-sm'
                            placeholder='Nhập mật khẩu'
                            onChange={(e) => setPassword(e.target.value)} value={password} required />
                        <button className='absolute right-3 cursor-pointer top-[14px] text-gray-400 hover:text-gray-600' onClick={() => setShowPassword(prev => !prev)}>
                            {!showPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                </div>
                {/* Role */}
                <div className='mb-6'>
                    <label htmlFor="role" className='block text-gray-700 font-medium mb-2 text-sm'>Đăng ký tài khoản với tư cách</label>
                    <div className='flex gap-2'>
                        {[
                            { value: "user", label: "Khách hàng" },
                            { value: "owner", label: "Chủ quán" },
                            { value: "delivery", label: "Người giao hàng" }
                        ].map((r) => (
                            <button className={`flex-1 border rounded-xl px-3 py-2 text-center font-medium transition-all text-sm ${role === r.value ? 'bg-[#ff4d2d] text-white border-[#ff4d2d] shadow-md shadow-orange-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                                onClick={() => setRole(r.value)}
                                key={r.value}
                            >{r.label}</button>
                        ))}
                    </div>
                </div>
                {/* Sign Up */}
                <button className='w-full font-bold rounded-xl py-3 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer shadow-lg shadow-orange-200 hover:shadow-orange-300 active:scale-[0.98]'
                    onClick={handleSignUp}>
                    Đăng ký
                </button>
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Hoặc</span>
                    </div>
                </div>
                <button className='w-full flex items-center justify-center gap-2 font-semibold rounded-xl px-4 py-3 transition 
                cursor-pointer duration-200 border border-gray-200 hover:bg-gray-50 text-gray-700 active:scale-[0.98]' onClick={handleGoogleAuth}>
                    <FcGoogle size={20} />
                    <span>Đăng ký với Google</span>
                </button>
                <p className='text-center mt-8 text-sm text-gray-600'>Đã có tài khoản? <span className='text-[#ff4d2d] font-bold cursor-pointer hover:underline' onClick={() => navigate("/signin")}>Đăng nhập</span> </p>
            </div>

        </div>
    )
}

export default SignUp
