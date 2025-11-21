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
        <div className='min-h-screen flex items-center justify-center p-4' style={{ backgroundColor: bgColor }}>
            <div className='bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px]' style={{ border: `1px solid ${borderColor}` }}>
                <h1 className='text-center text-3xl font-bold mb-2 tetx-[${primaryColor}]' style={{ color: primaryColor }}>GrubGo</h1>
                <p className='text-center tetx-gray-600 mb-8'>Đăng nhập tài khoản của riêng bạn để tham gia trải nghiệm vị giác của chúng tôi</p>
                {/*  Email */}
                <div className='mb-4'>
                    <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>Email</label>
                    <input type="email" className='w-full border rounded-lg px-3 py-2 focus:outline-none'
                        placeholder='Nhập email' style={{ border: `1px solid ${borderColor}` }}
                        onChange={(e) => setEmail(e.target.value)} value={email} required />
                </div>
                {/* Password */}
                <div className='mb-4'>
                    <label htmlFor="password" className='block text-gray-700 font-medium mb-1'>Password</label>
                    <div className='relative'>
                        <input type={`${showPassword ? 'text' : 'password'}`} className='w-full border rounded-lg px-3 py-2 focus:outline-none'
                            placeholder='Nhập password' style={{ border: `1px solid ${borderColor}` }}
                            onChange={(e) => setPassword(e.target.value)} value={password} required />
                        <button className='absolute right-3 cursor-pointer top-[14px] text-gray-500'
                            onClick={() => setShowPassword(prev => !prev)}>
                            {!showPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                </div>
                {/* Forgot Password */}
                <div className='text-right mb-4 text-[#ff4d2d] font-medium cursor-pointer' onClick={() => navigate("/forgotpassword")}>
                    Quên mật khẩu?
                </div>
                {/* Sign In */}
                <button className='w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer'
                    onClick={handleSignIn}>
                    Đăng nhập
                </button>
                <button className='w-full mt-4 flex items-center justify-center gap-2 font-semibold rounded-lg px-4 py-2 transition 
                cursor-pointer duration-200 border border-gray-400 hover:bg-gray-200' onClick={handleGoogleAuth}>
                    <FcGoogle size={20} />
                    <span>Đăng nhập với Google</span>
                </button>
                <p className='text-center mt-6 cursor-pointer' onClick={() => navigate("/signup")}>Tạo tài khoản mới ? <span className='text-[#ff4d2d] underline' >Đăng ký</span> </p>
            </div>

        </div>
    )
}

export default SignIn
