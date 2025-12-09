import React, { useEffect, useRef } from 'react'
import Nav from './Nav'
import CategoryCard from './CategoryCard'
import { useSelector } from 'react-redux';
import ShopCard from './ShopCard';
import FoodCard from './FoodCard';
import { useNavigate } from 'react-router-dom';
import useGetCategories from '../hooks/useGetCategories';

function UserDashBoard() {
  const { currentCity, shopsInMyCity, itemsInMyCity, searchItems, categories } = useSelector((state) => state.user);
  const [updatedItemsList, setUpdatedItemsList] = React.useState([]);
  const navigate = useNavigate();
  const cateScrollRef = useRef(null);
  const shopScrollRef = useRef(null);

  useGetCategories();

  const handleFilterByCategory = (category) => {
    if (category == "All") {
      setUpdatedItemsList(itemsInMyCity);
    }
    else {
      const filteredItems = itemsInMyCity.filter((item) =>
        item?.category?._id === category || item?.category?.name === category
      );
      setUpdatedItemsList(filteredItems);
    }
  }

  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity);
  }, [itemsInMyCity]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.deltaY === 0) return
      if (cateScrollRef.current && cateScrollRef.current.contains(e.target)) {
        e.preventDefault()
        cateScrollRef.current.scrollLeft += e.deltaY
      }
      else if (shopScrollRef.current && shopScrollRef.current.contains(e.target)) {
        e.preventDefault()
        shopScrollRef.current.scrollLeft += e.deltaY
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <div className='w-full min-h-screen bg-[#fff9f9] flex flex-col items-center gap-5 overflow-y-auto'>
      <Nav />
      {searchItems && searchItems.length > 0 && (
        <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-2xl mt-4'>
          <h1 className='text-gray-900 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2'>Kết quả tìm kiếm</h1>
          <div className='w-full h-auto flex flex-wrap gap-6 justify-center'>
            {searchItems.map((item) => (
              <FoodCard data={item} key={item._id} />
            ))}
          </div>
        </div>)}
      {/* Category */}
      <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>Danh mục món</h1>
        <div className='w-full'>
          <div ref={cateScrollRef} className='w-full flex overflow-x-auto gap-4 py-4 px-2'>
            {categories.map((cate, index) => (
              <CategoryCard name={cate.name} image={cate.image} key={index}
                onClick={() => handleFilterByCategory(cate.name)} />
            ))}
          </div>
        </div>
      </div>
      {/* Shops */}
      <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>Nhà hàng uy tín {currentCity}</h1>
        <div className='w-full'>
          <div ref={shopScrollRef} className='w-full flex overflow-x-auto gap-4 pb-2'>
            {shopsInMyCity?.map((shop, index) => (
              <ShopCard name={shop.name} image={shop.image} key={index}
                onClick={() => navigate(`/shop/${shop._id}`)} />
            ))}
          </div>
        </div>
      </div>
      {/* Food List */}
      <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>Món ăn gợi ý</h1>
        <div className='w-full h-auto flex flex-wrap gap-[20px] justify-center'>
          {updatedItemsList?.map((item, index) => (
            <FoodCard data={item} key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserDashBoard
