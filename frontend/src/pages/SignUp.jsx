import React from 'react'
import { useState } from 'react';
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

function SignUp() {
    const primaryColor = '#ff4d2d';
    const hoverColor = '#e64323'; 
    const bgColor = '#fff9f6';
    const borderColor = '#ddd';
const [showPassword, setShowPassword] = useState(false);

  return (
    <div className='min-h-screen flex items-center justify-center p-4' style={{backgroundColor: bgColor}}>
        <div className='bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px]' style={{border: `1px solid ${borderColor}`}}> 
            <h1 className='tetx-3xl font-bold mb-2 tetx-[${primaryColor}]' style={{color: primaryColor}}>GrubGo</h1>  
            <p className='tetx-gray-600 mb-8'>Create your account to get started with dilicious food deliveries</p>
            {/* Sign Up Form */}
            <div className='mb-4'>
                <label htmlFor="fullName" className='block text-gray-700 font-medium mb-1'>Full name</label>
                <input type="text" className='w-full border rounded-lg px-3 py-2 focus:outline-none' 
                placeholder='Enter your full name' style={{border: `1px solid ${borderColor}`}} />
            </div>
            <div className='mb-4'>
                <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>Email</label>
                <input type="email" className='w-full border rounded-lg px-3 py-2 focus:outline-none'
                placeholder='Enter your email' style={{border: `1px solid ${borderColor}`}} />
            </div>
            <div className='mb-4'>
                <label htmlFor="mobile" className='block text-gray-700 font-medium mb-1'>Mobile</label>
                <input type="mobile" className='w-full border rounded-lg px-3 py-2 focus:outline-none' 
                placeholder='Enter your mobile' style={{border: `1px solid ${borderColor}`}} />
            </div>
            <div className='mb-4'>
                <label htmlFor="password" className='block text-gray-700 font-medium mb-1'>Password</label>
                <div className='relative'>
                    <input type={`${showPassword ? 'text' : 'password'}`} className='w-full border rounded-lg px-3 py-2 focus:outline-none' 
                    placeholder='Enter your password' style={{border: `1px solid ${borderColor}`}} />                 
                    <button className='absolute right-3 cursor-pointer top-[14px] text-gray-500'onClick={()=>setShowPassword(prev=>!prev)}>
                        {!showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>   
                </div>          
            </div>

        </div>  
    </div>
  )
}

export default SignUp
