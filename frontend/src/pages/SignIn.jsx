import React from 'react'
import { useState } from 'react';
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';

function SignIn() {
    const primaryColor = '#ff4d2d';
    const hoverColor = '#e64323';
    const bgColor = '#fff9f6';
    const borderColor = '#ddd';
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = async () => {
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signin`, {
                email, password
            }, { withCredentials: true });
            console.log(result);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center p-4' style={{ backgroundColor: bgColor }}>
            <div className='bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px]' style={{ border: `1px solid ${borderColor}` }}>
                <h1 className='text-3xl font-bold mb-2 tetx-[${primaryColor}]' style={{ color: primaryColor }}>GrubGo</h1>
                <p className='tetx-gray-600 mb-8'>Sign In to your account to get started with dilicious food deliveries</p>
                {/*  Email */}
                <div className='mb-4'>
                    <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>Email</label>
                    <input type="email" className='w-full border rounded-lg px-3 py-2 focus:outline-none'
                        placeholder='Enter your email' style={{ border: `1px solid ${borderColor}` }}
                        onChange={(e) => setEmail(e.target.value)} value={email} />
                </div>
                {/* Password */}
                <div className='mb-4'>
                    <label htmlFor="password" className='block text-gray-700 font-medium mb-1'>Password</label>
                    <div className='relative'>
                        <input type={`${showPassword ? 'text' : 'password'}`} className='w-full border rounded-lg px-3 py-2 focus:outline-none'
                            placeholder='Enter your password' style={{ border: `1px solid ${borderColor}` }}
                            onChange={(e) => setPassword(e.target.value)} value={password} />
                        <button className='absolute right-3 cursor-pointer top-[14px] text-gray-500' 
                        onClick={() => setShowPassword(prev => !prev)}>
                            {!showPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                </div>
                {/* Forgot Password */}
                <div className='text-right mb-4 text-[#ff4d2d] font-medium cursor-pointer' onClick={() => navigate("/forgotpassword")}>
                    Forgot Password?
                </div>
                {/* Sign In */}
                <button className='w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer'
                    onClick={handleSignIn}>
                    Sign In
                </button>
                <button className='w-full mt-4 flex items-center justify-center gap-2 font-semibold rounded-lg px-4 py-2 transition cursor-pointer duration-200 border border-gray-400 hover:bg-gray-200'>
                    <FcGoogle size={20} />
                    <span>Sign in with Google</span>
                </button>
                <p className='text-center mt-6 cursor-pointer' onClick={() => navigate("/signup")}>Want to new account ? <span className='text-[#ff4d2d]' >Sign Up</span> </p>
            </div>

        </div>
    )
}

export default SignIn
