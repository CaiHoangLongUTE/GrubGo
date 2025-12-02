import axios from 'axios'
import { serverUrl } from '../App';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FaStore } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { FaUtensils } from "react-icons/fa";
import FoodCard from '../components/FoodCard';
import { FaBackward } from "react-icons/fa";

function Shop() {
  const { shopId } = useParams();
  const [items, setItems] = useState([]);
  const [shop, setShop] = useState({});
  const navigate = useNavigate();

  const handleShop = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`, { withCredentials: true });
      console.log(result.data);
      setShop(result.data.shop);
      setItems(result.data.items);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    handleShop();
  }, [shopId])
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='relative w-full h-[400px] lg:h-[500px] group overflow-hidden'>
        {/* Back Button - Glassmorphism */}
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

            {/* Cinematic Gradient Overlay */}
            <div className='absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent flex flex-col justify-end pb-10 px-6 md:px-16'>
              <div className='w-full max-w-7xl mx-auto animate-fade-in-up'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='bg-[#ff4d2d] text-white p-2 rounded-lg shadow-lg rotate-3'>
                    <FaStore size={20} />
                  </div>
                  <span className='text-orange-200 font-medium tracking-wider uppercase text-sm'>Official Store</span>
                </div>

                <h1 className='text-4xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight drop-shadow-2xl'>
                  {shop.name}
                </h1>

                <div className='flex flex-col md:flex-row md:items-center gap-4 text-gray-200'>
                  <div className='flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10'>
                    <FaLocationDot className='text-[#ff4d2d]' />
                    <p className='text-lg font-medium'>{shop.address}</p>
                  </div>
                  <div className='flex items-center gap-2 text-sm opacity-80'>
                    <span className='w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse'></span>
                    <span>Đang mở cửa</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className='max-w-7xl mx-auto px-6 py-10'>
        <h2 className='flex items-center justify-center gap-3 text-3xl font-bold mb-10 text-gray-800'>
          <FaUtensils color='red' />Menu</h2>
        {items.length > 0 ? (<div className='flex flex-wrap justify-center gap-8'>
          {items.map((item) => (
            <FoodCard key={item._id} data={item} />
          ))}
        </div>) : <p className='text-center text-gray-500 text-lg'>Không có món ăn</p>}
      </div>
    </div>
  )
}

export default Shop
