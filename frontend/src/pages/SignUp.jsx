import React from 'react'
import { useState } from 'react';
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

function SignUp() {
    const primaryColor = '#ff4d2d';
    const hoverColor = '#e64323';
    const bgColor = '#fff9f6';
    const borderColor = '#ddd';
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('user');

    return (
        <div className='min-h-screen flex items-center justify-center p-4' style={{ backgroundColor: bgColor }}>
            <div className='bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px]' style={{ border: `1px solid ${borderColor}` }}>
                <h1 className='text-3xl font-bold mb-2 tetx-[${primaryColor}]' style={{ color: primaryColor }}>GrubGo</h1>
                <p className='tetx-gray-600 mb-8'>Create your account to get started with dilicious food deliveries</p>
                {/* Full name */}
                <div className='mb-4'>
                    <label htmlFor="fullName" className='block text-gray-700 font-medium mb-1'>Full name</label>
                    <input type="text" className='w-full border rounded-lg px-3 py-2 focus:outline-none'
                        placeholder='Enter your full name' style={{ border: `1px solid ${borderColor}` }} />
                </div>
                {/*  Email */}
                <div className='mb-4'>
                    <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>Email</label>
                    <input type="email" className='w-full border rounded-lg px-3 py-2 focus:outline-none'
                        placeholder='Enter your email' style={{ border: `1px solid ${borderColor}` }} />
                </div>
                {/* Mobile */}
                <div className='mb-4'>
                    <label htmlFor="mobile" className='block text-gray-700 font-medium mb-1'>Mobile</label>
                    <input type="tel" className='w-full border rounded-lg px-3 py-2 focus:outline-none'
                        placeholder='Enter your mobile' style={{ border: `1px solid ${borderColor}` }} />
                </div>
                {/* Password */}
                <div className='mb-4'>
                    <label htmlFor="password" className='block text-gray-700 font-medium mb-1'>Password</label>
                    <div className='relative'>
                        <input type={`${showPassword ? 'text' : 'password'}`} className='w-full border rounded-lg px-3 py-2 focus:outline-none'
                            placeholder='Enter your password' style={{ border: `1px solid ${borderColor}` }} />
                        <button className='absolute right-3 cursor-pointer top-[14px] text-gray-500' onClick={() => setShowPassword(prev => !prev)}>
                            {!showPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                </div>
                {/* Role */}
                <div className='mb-4'>
                    <label htmlFor="role" className='block text-gray-700 font-medium mb-1'>Role</label>
                    <div className='flex gap-2'>
                        {["user", "owner", "driver"].map((r) => (
                            <button className='flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors' 
                            onClick={() => setRole(r)} 
                            style={role == r?{backgroundColor:primaryColor, color:"white"}:{border:`1px solid ${primaryColor}`, color:primaryColor}}>{r}</button>
                        ))}
                    </div>
                </div>
                
                <button className='w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e72e00] cursor-pointer'>
                    Sign Up
                </button>
                <button className='w-full mt-4 flex items-center justify-center gap-2 font-semibold rounded-lg px-4 py-2 transition duration-200 border border-gray-400 hover:bg-gray-200'>
                    <FcGoogle size={20} />
                    <span>Sign up with Google</span>
                </button>
                <p>Already have a account? <span >SignIn</span> </p>
            </div>
            
        </div>  
    )
}

export default SignUp
