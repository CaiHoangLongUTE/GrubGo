import React from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";

function Nav() {
    return (
        <div className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] 
        fixed top-0 z-[9999] bg-[#fff9f9] overflow-visible'>
            <h1 className='text-3xl font-bold mb-2 text-[#ff4d2d]'>GrubGo</h1>
            <div className='md:w-[60%] lg:w-[40%] h-[70%] bg-white shadow-xl rounded-lg items-center gap-[20px] flex'>
                <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
                    <FaLocationDot size={24} className='text-[#ff4d2d]' />
                    <div className='w-[80%] truncate text-gray-600 font-bold'>Da Nang</div>
                </div>
                <div className='w-[80%] flex items-center gap-[10px] px-[10px]'>
                    <IoIosSearch size={24} className='text-[#ff4d2d]' />
                    <input type="text" placeholder='Search delicious food' className='px-[10px] text-gray-700 outline-0 w-full' />
                </div>
            </div>
            <div className='relative cursor-pointer'>
                <FiShoppingCart size={24} className='text-[#ff4d2d]'/>
                <span className='absolute right-[-9px] top-[-12px] text-[#ff4d2d] font-bold'>0</span>
            </div>
            <button className='hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium'>
                My orders
            </button>
        </div>
    )
}

export default Nav
