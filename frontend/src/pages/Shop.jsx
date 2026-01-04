import axios from 'axios'
import { serverUrl } from '../App';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaStore, FaPhone, FaClock, FaLocationDot, FaUtensils, FaBackward, FaStar, FaCommentDots } from "react-icons/fa6"; // Thêm FaCommentDots
import FoodCard from '../components/FoodCard';
import ReviewCard from '../components/ReviewCard';

function Shop() {
  const { shopId } = useParams();
  const [items, setItems] = useState([]);
  const [shop, setShop] = useState({});
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const navigate = useNavigate();

  // Giữ nguyên các hàm bổ trợ
  const formatPhone = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 4)}.${cleaned.slice(4, 7)}.${cleaned.slice(7)}`;
    }
    return phone;
  };

  const isShopOpen = () => {
    if (!shop.openTime || !shop.closeTime) return true;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = shop.openTime.split(':').map(Number);
    const openTimeInMinutes = openHour * 60 + openMin;
    const [closeHour, closeMin] = shop.closeTime.split(':').map(Number);
    const closeTimeInMinutes = closeHour * 60 + closeMin;
    return currentTime >= openTimeInMinutes && currentTime <= closeTimeInMinutes;
  };

  const handleShop = async () => {
    try {
      const [shopResult, reviewsResult] = await Promise.all([
        axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`, { withCredentials: true }),
        axios.get(`${serverUrl}/api/review/shop/${shopId}`)
      ]);
      setShop(shopResult.data.shop);
      setItems(shopResult.data.items);
      setReviews(reviewsResult.data);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    handleShop();
  }, [shopId])

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Giữ nguyên Hero Section */}
      <div className='relative w-full h-[400px] lg:h-[500px] group overflow-hidden'>
        <button
          className='absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/10 text-white px-5 py-2.5 rounded-full shadow-lg hover:bg-white/30 transition-all duration-300 group/back'
          onClick={() => navigate("/")}
        >
          <FaBackward className="group-hover/back:-translate-x-1 transition-transform" />
          <span className="font-medium tracking-wide">Quay lại</span>
        </button>

        {shop && (
          <>
            <img
              src={shop.image}
              alt={shop.name}
              className='w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent flex flex-col justify-end pb-10 px-6 md:px-16'>
              <div className='w-full max-w-7xl mx-auto animate-fade-in-up'>
                <div className='flex items-center gap-3 mb-4'>
                  {(shop.ratings?.average || 0) >= 4.5 && (
                    <>
                      <div className='bg-[#ff4d2d] text-white p-2 rounded-lg shadow-lg rotate-3'>
                        <FaStore size={20} />
                      </div>
                      <span className='text-orange-200 font-medium tracking-wider uppercase text-sm'>Official Shop</span>
                    </>
                  )}
                  <div className={`flex items-center gap-1 text-yellow-400 ${(shop.ratings?.average || 0) >= 4.5 ? 'border-l border-white/30 pl-3 ml-1' : ''}`}>
                    <FaStar size={14} />
                    <span className='text-white text-sm font-medium'>
                      {shop.ratings?.average || 0}/5 ({shop.ratings?.count || 0} đánh giá)
                    </span>
                  </div>
                </div>

                <h1 className='text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight drop-shadow-2xl'>
                  {shop.name}
                </h1>

                <div className='flex flex-col md:flex-row md:items-center gap-4 text-gray-200 flex-wrap'>
                  <div className='flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10'>
                    <FaLocationDot className='text-[#ff4d2d]' />
                    <p className='text-lg font-medium'>{shop.address} - {shop.commune} - {shop.district} - {shop.city}</p>
                  </div>
                  {shop.hotline && (
                    <div className='flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10'>
                      <FaPhone className='text-[#ff4d2d]' />
                      <p className='text-lg font-medium'>{formatPhone(shop.hotline)}</p>
                    </div>
                  )}
                  {(shop.openTime || shop.closeTime) && (
                    <div className='flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10'>
                      <FaClock className='text-[#ff4d2d]' />
                      <p className='text-lg font-medium'>{shop.openTime || "..."} - {shop.closeTime || "..."}</p>
                    </div>
                  )}
                  <div className='flex items-center gap-2 text-sm opacity-80 ml-2'>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isShopOpen() ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    <span>{isShopOpen() ? 'Đang mở cửa' : 'Đã đóng cửa'}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- PHẦN TAGS CHIA TAB MỚI THÊM --- */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-center gap-10">
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-4 px-4 flex items-center gap-2 font-bold transition-all border-b-4 ${activeTab === 'menu' ? 'border-[#ff4d2d] text-[#ff4d2d]' : 'border-transparent text-gray-500'
              }`}
          >
            <FaUtensils /> Menu
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-4 px-4 flex items-center gap-2 font-bold transition-all border-b-4 ${activeTab === 'reviews' ? 'border-[#ff4d2d] text-[#ff4d2d]' : 'border-transparent text-gray-500'
              }`}
          >
            <FaCommentDots /> Đánh giá ({reviews.length})
          </button>
        </div>
      </div>

      {/* --- NỘI DUNG THAY ĐỔI THEO TAB --- */}
      <div className='max-w-7xl mx-auto px-6 py-10'>
        {activeTab === 'menu' ? (
          <div>
            {items.length > 0 ? (
              <div className='flex flex-wrap justify-center gap-8'>
                {items.map((item) => (
                  <FoodCard key={item._id} data={item} />
                ))}
              </div>
            ) : <p className='text-center text-gray-500 text-lg'>Không có món ăn</p>}
          </div>
        ) : (
          <div>
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
                <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaStar size={30} className="text-orange-300" />
                </div>
                <p className="text-gray-500 text-lg">Chưa có đánh giá nào cho quán ăn này.</p>
                <p className="text-gray-400 text-sm mt-2">Hãy là người đầu tiên thưởng thức và đánh giá!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Shop