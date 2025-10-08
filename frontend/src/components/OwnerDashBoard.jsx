import Nav from './Nav'
import { useSelector } from 'react-redux';
import { FaUtensils } from "react-icons/fa";

function OwnerDashBoard() {
  const { myShopData } = useSelector(state => state.owner);

  return (
    <div className='w-full min-h-screen bg-[#fff9f9] flex flex-col items-center'>
      <Nav />
      {!myShopData &&
        <div className='flex justify-center items-center p-4 sm:p-6'>
          <div className='w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300'>
            <div className='flex flex-col items-center text-center'>
              <FaUtensils size={24} className='text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4' />
              <h2 className='text-xl sm:text-2xl font-bold text-gray-800 mb-2'>Add your restaurant</h2>
              <p className='text-gray-600 mb-4 text-sm sm:text-base'>Join our food delivery platform and start accepting orders for your delicious dishes.</p>
              <button className='bg-[#ff4d2d] text-white py-2 px-5 rounded-full hover:bg-orange-600 font-medium
              transition-colors duration-200'>
                Get started
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  );
}

export default OwnerDashBoard;
