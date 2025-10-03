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
    const primaryColor = '#ff4d2d';
    const hoverColor = '#e64323';
    const bgColor = '#fff9f6';
    const borderColor = '#ddd';
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
            toast.success("Sign up successful", { duration: 2000 });
            navigate('/signin');
            console.log(result);
            dispatch(setUserData(result.data));
        } catch (error) {
            toast.error(error.response?.data?.message || "Sign up failed", { duration: 2000 });
            console.log(error);
        }
    }

    const handleGoogleAuth = async () => {
        if (!mobile) {
            return toast.error("Please enter mobile number before Google Sign Up", { duration: 2000 });
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
            toast.success("Sign up with Google successful", { duration: 2000 });
            navigate('/signin');
            console.log(data);
            dispatch(setUserData(data));
        } catch (error) {
            toast.error(error.response?.data?.message || "Sign up with Google failed", { duration: 2000 });
            console.log(error);
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center p-4' style={{ backgroundColor: bgColor }}>
            <div className='bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px]' style={{ border: `1px solid ${borderColor}` }}>
                <h1 className='text-3xl font-bold mb-2 tetx-[${primaryColor}]' style={{ color: primaryColor }}>GrubGo</h1>
                <p className='tetx-gray-600 mb-8'>Create your account to get started with dilicious food deliveries</p>
                {/* Full name */}
                <div className='mb-4'>
                    <label htmlFor="fullName" className='block text-gray-700 font-medium mb-1'>Full name</label>
                    <input type="text" className='w-full border rounded-lg px-3 py-2 focus:outline-none'
                        placeholder='Enter your full name' style={{ border: `1px solid ${borderColor}` }}
                        onChange={(e) => setFullName(e.target.value)} value={fullName} required />
                </div>
                {/*  Email */}
                <div className='mb-4'>
                    <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>Email</label>
                    <input type="email" className='w-full border rounded-lg px-3 py-2 focus:outline-none'
                        placeholder='Enter your email' style={{ border: `1px solid ${borderColor}` }}
                        onChange={(e) => setEmail(e.target.value)} value={email} required />
                </div>
                {/* Mobile */}
                <div className='mb-4'>
                    <label htmlFor="mobile" className='block text-gray-700 font-medium mb-1'>Mobile</label>
                    <input type="tel" className='w-full border rounded-lg px-3 py-2 focus:outline-none'
                        placeholder='Enter your mobile' style={{ border: `1px solid ${borderColor}` }}
                        onChange={(e) => setMobile(e.target.value)} value={mobile} required />
                </div>
                {/* Password */}
                <div className='mb-4'>
                    <label htmlFor="password" className='block text-gray-700 font-medium mb-1'>Password</label>
                    <div className='relative'>
                        <input type={`${showPassword ? 'text' : 'password'}`} className='w-full border rounded-lg px-3 py-2 focus:outline-none'
                            placeholder='Enter your password' style={{ border: `1px solid ${borderColor}` }}
                            onChange={(e) => setPassword(e.target.value)} value={password} required />
                        <button className='absolute right-3 cursor-pointer top-[14px] text-gray-500' onClick={() => setShowPassword(prev => !prev)}>
                            {!showPassword ? <FaEye /> : <FaEyeSlash />}
                        </button>
                    </div>
                </div>
                {/* Role */}
                <div className='mb-4'>
                    <label htmlFor="role" className='block text-gray-700 font-medium mb-1'>Role</label>
                    <div className='flex gap-2'>
                        {["user", "owner", "delivery"].map((r) => (
                            <button className='flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors'
                                onClick={() => setRole(r)}
                                style={role == r ? { backgroundColor: primaryColor, color: "white" } : { border: `1px solid ${primaryColor}`, color: primaryColor }}>{r}</button>
                        ))}
                    </div>
                </div>
                {/* Sign Up */}
                <button className='w-full font-semibold rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e72e00] cursor-pointer'
                    onClick={handleSignUp}>
                    Sign Up
                </button>
                <button className='w-full mt-4 flex items-center justify-center gap-2 font-semibold rounded-lg px-4 py-2 transition 
                cursor-pointer duration-200 border border-gray-400 hover:bg-gray-200' onClick={handleGoogleAuth}>
                    <FcGoogle size={20} />
                    <span>Sign up with Google</span>
                </button>
                <p className='text-center mt-6 cursor-pointer' onClick={() => navigate("/signin")}>Already have a account ? <span className='text-[#ff4d2d]' >Sign In</span> </p>
            </div>

        </div>
    )
}

export default SignUp
