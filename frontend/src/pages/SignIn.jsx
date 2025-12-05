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

function SignIn() {
    const primaryColor = '#ff4d2d';
    const hoverColor = '#e64323';
    const bgColor = '#fff9f6';
    const borderColor = '#ddd';
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();

    const handleSignIn = async () => {
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signin`, {
                email, password
            }, { withCredentials: true });
            toast.success("Đăng nhập thành công", { duration: 2000 });
            navigate("/");
            console.log(result);
            dispatch(setUserData(result.data));
        } catch (error) {
            toast.error(error.response?.data?.message || "Đăng nhập thất bại", { duration: 2000 });
            console.log(error);
        }
    }

    const handleGoogleAuth = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        try {
            const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                email: result.user.email,
            }, { withCredentials: true });
            toast.success("Đăng nhập với Google thành công", { duration: 2000 });
            navigate("/");
            console.log(data);
            dispatch(setUserData(data));
        } catch (error) {
            toast.error(error.response?.data?.message || "Đăng nhập với Google thất bại", { duration: 2000 });
            console.log(error);
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center p-4 bg-[#fff9f6]'>
            <div className='bg-white rounded-2xl shadow-xl w-full max-w-md p-8 border border-gray-100'>
                <h1 className='text-center text-3xl font-extrabold mb-2 text-[#ff4d2d]'>GrubGo</h1>
                <p className='text-center text-gray-500 mb-8 text-sm'>Đăng nhập tài khoản của riêng bạn để tham gia trải nghiệm vị giác của chúng tôi</p>
                {/*  Email */}
                <div className='mb-4'>
                    <label htmlFor="email" className='block text-gray-700 font-medium mb-1.5 text-sm'>Email</label>
                    <input type="email" className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] bg-gray-50 transition-all text-sm'
                        placeholder='Nhập email'
                        onChange={(e) => setEmail(e.target.value)} value={email} required />
                </div>
                {/* Password */}
                <div className='mb-4'>
                    <label htmlFor="password" className='block text-gray-700 font-medium mb-1.5 text-sm'>Password</label>
                    <div className='relative'>
                        <input type={`${showPassword ? 'text' : 'password'}`} className='w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] bg-gray-50 transition-all text-sm'
                            placeholder='Nhập password'
                            onChange={(e) => setPassword(e.target.value)} value={password} required />
                        <button className='absolute right-3 cursor-pointer top-[14px] text-gray-400 hover:text-gray-600'
                            onClick={() => setShowPassword(prev => !prev)}>
                            {!showPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                </div>
                {/* Forgot Password */}
                <div className='text-right mb-6'>
                    <span className='text-[#ff4d2d] font-medium cursor-pointer text-sm hover:underline' onClick={() => navigate("/forgotpassword")}>
                        Quên mật khẩu?
                    </span>
                </div>
                {/* Sign In */}
                <button className='w-full font-bold rounded-xl py-3 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer shadow-lg shadow-orange-200 hover:shadow-orange-300 active:scale-[0.98]'
                    onClick={handleSignIn}>
                    Đăng nhập
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
                    <span>Đăng nhập với Google</span>
                </button>
                <p className='text-center mt-8 text-sm text-gray-600'>Chưa có tài khoản? <span className='text-[#ff4d2d] font-bold cursor-pointer hover:underline' onClick={() => navigate("/signup")}>Đăng ký ngay</span> </p>
            </div>

        </div>
    )
}

export default SignIn
