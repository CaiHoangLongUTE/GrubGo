import { useEffect, useState } from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import { FaPlus } from "react-icons/fa6";
import { FaLongArrowAltLeft } from "react-icons/fa";
import { TbReceipt } from "react-icons/tb";
import { ImProfile } from "react-icons/im";
import { useDispatch, useSelector } from 'react-redux';
import { serverUrl } from '../App';
import { setSearchItems, setUserData } from '../redux/userSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Nav() {
    const { userData, currentCity, cartItems } = useSelector(state => state.user);
    const { myShopData } = useSelector(state => state.owner);
    const [showInfo, setShowInfo] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleLogOut = async () => {
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signout`, {}, { withCredentials: true });
            dispatch(setUserData(null));
            toast.success("Đăng xuất thành công", { duration: 2000 });
        } catch (error) {
            console.log(error);
        }
    }
    const handleSearchItems = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,
                { withCredentials: true }
            );
            dispatch(setSearchItems(result.data));
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (query && query.trim().length > 0) {
            handleSearchItems();
        } else {
            dispatch(setSearchItems(null));
        }
    }, [query])
    return (
        <div className='w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] 
        fixed top-0 z-[9999] bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300'>
            {(!userData || userData?.role == "user") && showSearch &&
                <div className='w-[90%] h-[60px] bg-white shadow-lg border border-gray-100 rounded-full items-center gap-[20px] flex fixed
                top-[90px] left-[5%] md:hidden z-[9999]'>
                    <div className='flex items-center w-[35%] overflow-hidden gap-[8px] pl-4 border-r border-gray-200'>
                        <FaLocationDot size={20} className='text-[#ff4d2d] shrink-0' />
                        <div className='truncate text-gray-700 font-medium text-sm'>{currentCity}</div>
                    </div>
                    <div className='flex-1 flex items-center gap-[10px] pr-4'>
                        <IoIosSearch size={22} className='text-gray-400' />
                        <input type="text" placeholder='Tìm món ăn...' className='w-full text-gray-700 outline-none text-sm'
                            onChange={(e) => setQuery(e.target.value)} value={query} />
                    </div>
                </div>
            }
            <h1 className='text-3xl font-extrabold tracking-tight text-[#ff4d2d] cursor-pointer' onClick={() => navigate("/")}>GrubGo</h1>

            {(!userData || userData?.role == "user") &&
                <div className='md:w-[50%] lg:w-[40%] h-[50px] bg-gray-50 hover:bg-white border border-gray-200 hover:shadow-md hover:border-gray-300 rounded-full items-center gap-[15px] hidden md:flex transition-all duration-300 group'>
                    <div className='flex items-center w-[30%] overflow-hidden gap-[8px] pl-5 border-r border-gray-300 h-[60%]'>
                        <FaLocationDot size={18} className='text-[#ff4d2d]' />
                        <div className='truncate text-gray-700 font-medium text-sm'>{currentCity}</div>
                    </div>
                    <div className='flex-1 flex items-center gap-[10px] pr-5'>
                        <IoIosSearch size={20} className='text-gray-400 group-hover:text-[#ff4d2d] transition-colors' />
                        <input type="text" placeholder='Tìm kiếm món ăn...' className='w-full bg-transparent text-gray-700 outline-none text-sm'
                            onChange={(e) => setQuery(e.target.value)} value={query} />
                    </div>
                </div>}

            <div className='flex items-center gap-4'>
                {(!userData || userData?.role == "user") && (
                    <button className='md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors' onClick={() => setShowSearch(!showSearch)}>
                        {showSearch ? <RxCross1 size={24} className='text-gray-600' /> : <IoIosSearch size={24} className='text-gray-600' />}
                    </button>
                )}

                {userData?.role == "owner" ? <>
                    {myShopData && <>
                        <button className='hidden md:flex items-center gap-2 px-4 py-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 hover:bg-[#ff4d2d]/20
                        text-[#ff4d2d] transition-all duration-300 font-medium text-sm' onClick={() => navigate("/add-item")}>
                            <FaPlus size={16} />
                            <span>Thêm món</span>
                        </button>
                        <button className='md:hidden flex items-center p-2 cursor-pointer rounded-full bg-[#ff4d2d]/10 
                        text-[#ff4d2d]' onClick={() => navigate("/add-item")}>
                            <FaPlus size={20} />
                        </button>
                    </>}
                    <div className='hidden md:flex items-center gap-2 cursor-pointer relative px-4 py-2 rounded-full 
                    hover:bg-gray-100 text-gray-700 font-medium transition-colors text-sm' onClick={() => navigate("/my-orders")}>
                        <TbReceipt size={16} />
                        <span>Đơn hàng</span>
                    </div>
                    <button className='md:hidden flex items-center p-2 cursor-pointer rounded-full hover:bg-gray-100 
                    text-gray-600' onClick={() => navigate("/my-orders")}>
                        <TbReceipt size={20} />
                    </button>
                </> : (<>
                    {userData?.role == "user" &&
                        <div className='relative cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors group' onClick={() => navigate("/cart")}>
                            <FiShoppingCart size={24} className='text-gray-600 group-hover:text-[#ff4d2d] transition-colors' />
                            {cartItems.length > 0 &&
                                <span className='absolute top-0 right-0 bg-[#ff4d2d] text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white transform translate-x-1 -translate-y-1 shadow-sm'>
                                    {cartItems.length}
                                </span>
                            }
                        </div>}
                </>)}

                <div className='relative'>
                    {userData?.avatar ? (
                        <img
                            src={userData.avatar}
                            alt="Avatar"
                            className='w-[42px] h-[42px] rounded-full object-cover shadow-md shadow-orange-200 cursor-pointer hover:shadow-lg transition-all active:scale-95 border-2 border-white'
                            onClick={() => setShowInfo(prev => !prev)}
                        />
                    ) : (
                        <div className='w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#ff4d2d] to-[#ff7e5f] text-white text-[18px] flex items-center justify-center 
                        font-bold shadow-md shadow-orange-200 cursor-pointer hover:shadow-lg transition-all active:scale-95 border-2 border-white' onClick={() => setShowInfo(prev => !prev)}>
                            {userData?.fullName?.slice(0, 1).toUpperCase() || 'U'}
                        </div>
                    )}
                    {showInfo &&
                        <>
                            <div className='fixed inset-0 z-[9998]' onClick={() => setShowInfo(false)}></div>
                            <div className='absolute top-[55px] right-0 w-[220px] bg-white shadow-2xl shadow-gray-200/50
                            rounded-2xl p-2 flex flex-col gap-1 z-[9999] border border-gray-100'>
                                <div className='px-4 py-3 border-b border-gray-100 mb-1'>
                                    <p className='text-sm text-gray-500'>Xin chào,</p>
                                    <p className='text-base font-bold text-gray-800 truncate'>{userData?.fullName || 'Guest'}</p>
                                </div>

                                {userData?.role == "user" && <>
                                    <div className='px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl cursor-pointer flex items-center gap-3 transition-colors font-medium'
                                        onClick={() => navigate("/my-orders")}>
                                        <TbReceipt size={18} className="text-gray-400" /> Đơn hàng
                                    </div>
                                </>}
                                <div className='px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl cursor-pointer flex items-center gap-3 transition-colors font-medium'
                                    onClick={() => navigate("/my-profile")}>
                                    <ImProfile size={16} className="text-gray-400" /> Tài khoản
                                </div>
                                <div className='px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer flex items-center gap-3 transition-colors font-medium' onClick={handleLogOut}>
                                    <FaLongArrowAltLeft size={18} /> Đăng xuất
                                </div>
                            </div>
                        </>
                    }
                </div>
            </div>
        </div >
    )
}

export default Nav
