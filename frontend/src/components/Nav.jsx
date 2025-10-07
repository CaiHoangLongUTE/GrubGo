import { useState } from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import { useDispatch, useSelector } from 'react-redux';
import { serverUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

function Nav() {
    const { userData, city } = useSelector(state => state.user);
    const [showInfo, setShowInfo] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const dispatch = useDispatch();
    const handleLogOut = async () => {
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signout`, { withCredentials: true });
            dispatch(setUserData(null));
            toast.success("Log out successful", { duration: 2000 });
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] 
        fixed top-0 z-[9999] bg-[#fff9f9] overflow-visible'>
            {showSearch &&
                <div className='w-[90%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] flex fixed
                top-[80px] left-[5%] md:hidden'>
                    <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
                        <FaLocationDot size={24} className='text-[#ff4d2d]' />
                        <div className='w-[80%] truncate text-gray-600 font-bold'>{city}</div>
                    </div>
                    <div className='w-[80%] flex items-center gap-[10px] px-[10px]'>
                        <IoIosSearch size={24} className='text-[#ff4d2d]' />
                        <input type="text" placeholder='Search delicious food' className='px-[10px] text-gray-700 outline-0 w-full' />
                    </div>
                </div>
            }
            <h1 className='text-3xl font-bold mb-2 text-[#ff4d2d]'>GrubGo</h1>
            <div className='md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] hidden md:flex'>
                <div className='flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400'>
                    <FaLocationDot size={24} className='text-[#ff4d2d]' />
                    <div className='w-[80%] truncate text-gray-600 font-bold'>{city}</div>
                </div>
                <div className='w-[80%] flex items-center gap-[10px] px-[10px]'>
                    <IoIosSearch size={24} className='text-[#ff4d2d]' />
                    <input type="text" placeholder='Search delicious food' className='px-[10px] text-gray-700 outline-0 w-full' />
                </div>
            </div>
            <div className='flex items-center gap-4'>
                {showSearch
                    ? <RxCross1 size={24} className='text-[#ff4d2d] md:hidden' onClick={() => setShowSearch(false)} />
                    : <IoIosSearch size={24} className='text-[#ff4d2d] md:hidden' onClick={() => setShowSearch(true)} />}
                <div className='relative cursor-pointer'>
                    <FiShoppingCart size={24} className='text-[#ff4d2d]' />
                    <span className='absolute right-[-9px] top-[-12px] text-[#ff4d2d] font-bold'>0</span>
                </div>
                <button className='hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium'>
                    My Orders
                </button>
                <div className='w-[40px] h-[40px] rounded-full bg-[#ff4d2d] text-white text-[18px] flex items-center justify-center 
                font-semibold shadow-xl cursor-pointer' onClick={() => setShowInfo(prev => !prev)}>
                    {userData?.fullName.slice(0, 1).toUpperCase() || 'U'}
                </div>
                {showInfo &&
                    <div className='fixed top-[80px] right-[10px] md:right-[10%] lg-right-[25%] w-[180px] bg-white shadow-2xl 
                    rounded-xl p-[20px] flex flex-col gap-[10px] z-[9999]'>
                        <div className='tetx-[16px] font-semibold'>{userData.fullName}</div>
                        <div className='md:hidden text-[#ff4d2d] font-semibold cursor-pointer'>My Orders</div>
                        <div className='text-[#ff4d2d] font-semibold cursor-pointer' onClick={handleLogOut}>Log Out</div>
                    </div>
                }
            </div>
        </div>
    )
}

export default Nav
