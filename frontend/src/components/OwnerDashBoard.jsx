import Nav from './Nav'
import { useSelector } from 'react-redux';
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaPen } from "react-icons/fa";
import OwnerItemCard from './OwnerItemCard';

function OwnerDashBoard() {
  const { myShopData } = useSelector(state => state.owner);
  const navigate = useNavigate();
  console.log("🧩 myShopData:", myShopData);
  console.log("🍱 myShopData.items:", myShopData?.items);

  return (
    <div className='w-full min-h-screen bg-[#fff9f9] flex flex-col items-center'>
      <Nav />
      {!myShopData &&
        <div className='flex justify-center items-center p-4 sm:p-6'>
          <div className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300'>
            <div className='flex flex-col items-center text-center'>
              <FaUtensils size={24} className='text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4' />
              <h2 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>Thêm nhà hàng của bạn</h2>
              <p className='text-gray-600 mb-4 text-sm sm:text-base'>Tham gia nền tảng giao hàng thức ăn và bắt đầu nhận đơn hàng cho các món ăn ngon miệng của bạn.</p>
              <button className='bg-[#ff4d2d] text-white py-2 px-5 rounded-full hover:bg-orange-600 font-medium
              transition-colors duration-200' onClick={() => navigate("/create-edit-shop")}>
                Bắt đầu
              </button>
            </div>
          </div>
        </div>
      }
      {myShopData &&
        <div className='w-full flex flex-col items-center gap-8 py-8 px-4'>
          {/* Shop Hero Section - Modern Style */}
          <div className='relative w-full max-w-6xl h-64 md:h-80 lg:h-96 rounded-3xl overflow-hidden shadow-2xl group'>
            <img
              src={myShopData.image}
              alt={myShopData.name}
              className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
            />

            {/* Gradient Overlay - Bottom Up */}
            <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6 md:p-10'>
              <div className='transform transition-all duration-500 translate-y-0'>
                <div className='flex items-center gap-3 mb-2'>
                  <span className='bg-[#ff4d2d] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm'>
                    Nhà hàng
                  </span>
                  <div className='flex items-center gap-1 text-yellow-400'>
                    <FaUtensils size={14} />
                    <span className='text-white text-sm font-medium'>Ẩm thực</span>
                  </div>
                </div>

                <h1 className='text-3xl md:text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg'>
                  {myShopData.name}
                </h1>

                <div className='flex flex-col gap-1'>
                  <p className='text-lg font-medium text-gray-100 flex items-center gap-2'>
                    {myShopData.city}, {myShopData.state}
                  </p>
                  <p className='text-sm text-gray-300 opacity-90 font-light'>
                    {myShopData.address}
                  </p>
                </div>
              </div>

              {/* Edit Button - Glassmorphism */}
              <button
                className='absolute top-6 right-6 bg-white/20 backdrop-blur-md border border-white/30 text-white p-3 rounded-full shadow-lg hover:bg-white hover:text-[#ff4d2d] transition-all duration-300 group/btn'
                onClick={() => navigate("/create-edit-shop")}
                title="Chỉnh sửa thông tin"
              >
                <FaPen size={18} className="transform group-hover/btn:rotate-12 transition-transform" />
              </button>
            </div>
          </div>

          {myShopData.items.length === 0 &&
            <div className='flex justify-center items-center p-4 sm:p-6'>
              <div className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300'>
                <div className='flex flex-col items-center text-center'>
                  <FaUtensils size={24} className='text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4' />
                  <h2 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>Thêm món ăn của bạn</h2>
                  <p className='text-gray-600 mb-4 text-sm sm:text-base'>Chia sẻ món ăn ngon miệng của bạn với nền tảng giao hàng thức ăn.</p>
                  <button className='bg-[#ff4d2d] text-white py-2 px-5 rounded-full hover:bg-orange-600 font-medium
                  transition-colors duration-200' onClick={() => navigate("/add-item")}>
                    Thêm món ăn
                  </button>
                </div>
              </div>
            </div>}
          {myShopData?.items?.length > 0 &&
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 justify-items-center">
                {myShopData.items.map((item, index) => (
                  <OwnerItemCard data={item} key={index} />
                ))}
              </div>
            </div>}

        </div>}
    </div>
  );
}

export default OwnerDashBoard;
