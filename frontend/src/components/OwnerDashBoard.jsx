import Nav from './Nav'
import { useSelector } from 'react-redux';
import { FaUtensils, FaStar } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaPen } from "react-icons/fa";
import OwnerItemCard from './OwnerItemCard';

function OwnerDashBoard() {
  const { myShopData } = useSelector(state => state.owner);
  const navigate = useNavigate();

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
      {myShopData && (
        <div className='w-full flex flex-col items-center gap-8 py-8 px-4'>

          {/* Status: PENDING */}
          {myShopData.status === 'pending' && (
            <div className='w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8 border border-orange-100 text-center'>
              <div className="flex justify-center mb-6">
                <div className="bg-yellow-50 p-4 rounded-full">
                  <FaUtensils className="text-yellow-500 w-16 h-16" />
                </div>
              </div>
              <h2 className='text-2xl font-bold text-gray-800 mb-4'>Đơn đăng ký đang được duyệt</h2>
              <p className='text-gray-600 mb-6'>
                Cảm ơn bạn đã đăng ký đối tác với GrubGo. Đội ngũ admin đang xem xét thông tin và giấy phép của bạn.
                <br />Vui lòng kiên nhẫn chờ đợi, chúng tôi sẽ phản hồi sớm nhất có thể.
              </p>
              <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium text-sm">
                Trạng thái: Chờ duyệt (Pending)
              </div>
            </div>
          )}

          {/* Status: REJECTED */}
          {myShopData.status === 'rejected' && (
            <div className='w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8 border border-red-100 text-center'>
              <div className="flex justify-center mb-6">
                <div className="bg-red-50 p-4 rounded-full">
                  <FaUtensils className="text-red-500 w-16 h-16" />
                </div>
              </div>
              <h2 className='text-2xl font-bold text-gray-800 mb-4'>Đơn đăng ký bị từ chối</h2>
              <p className='text-gray-600 mb-6'>
                Rất tiếc, đơn đăng ký quán ăn của bạn chưa đạt yêu cầu hoặc thông tin chưa chính xác.
                <br />Vui lòng kiểm tra lại thông tin và giấy tờ, sau đó cập nhật lại.
              </p>
              <button
                onClick={() => navigate("/create-edit-shop")}
                className='bg-[#ff4d2d] text-white py-3 px-8 rounded-xl hover:bg-[#e64323] font-bold shadow-lg shadow-orange-200 transition-all'
              >
                Cập nhật thông tin & Gửi lại
              </button>
            </div>
          )}

          {/* Status: DISABLED */}
          {myShopData.status === 'disabled' && (
            <div className='w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8 border border-gray-200 text-center'>
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 p-4 rounded-full">
                  <FaUtensils className="text-gray-500 w-16 h-16" />
                </div>
              </div>
              <h2 className='text-2xl font-bold text-gray-800 mb-4'>Cửa hàng đã bị vô hiệu hóa</h2>
              <p className='text-gray-600 mb-6'>
                Cửa hàng của bạn hiện đang bị khóa tạm thời.
                <br />Vui lòng liên hệ với ban quản trị để biết thêm chi tiết và được hỗ trợ mở lại.
              </p>
              <div className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium text-sm">
                Trạng thái: Đã khóa (Disabled)
              </div>
            </div>
          )}

          {/* Status: ACTIVE (Original Dashboard) */}
          {myShopData.status === 'active' && (
            <>
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
                      <div className='flex items-center gap-1 text-yellow-400 border-l border-white/30 pl-3 ml-1'>
                        <FaStar size={14} />
                        <span className='text-white text-sm font-medium'>
                          {myShopData.ratings?.average || 0}/5 ({myShopData.ratings?.count || 0} đánh giá)
                        </span>
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

              {(!myShopData?.items || myShopData.items.length === 0) &&
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
                    {myShopData?.items?.map((item, index) => (
                      <OwnerItemCard data={item} key={index} />
                    ))}
                  </div>
                </div>}
            </>
          )}

        </div>
      )}</div>
  );
}

export default OwnerDashBoard;
