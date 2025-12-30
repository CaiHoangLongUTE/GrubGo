import React, { useEffect, useRef } from 'react'
import Nav from './Nav'
import CategoryCard from './CategoryCard'
import { useSelector } from 'react-redux';
import ShopCard from './ShopCard';
import FoodCard from './FoodCard';
import { useNavigate } from 'react-router-dom';
import useGetCategories from '../hooks/useGetCategories';

import { FaUtensils, FaGlassMartiniAlt, FaLayerGroup } from "react-icons/fa"; // Added icons

function UserDashBoard() {
  const { currentCity, shopsInMyCity, itemsInMyCity, searchItems, categories } = useSelector((state) => state.user);
  const [updatedItemsList, setUpdatedItemsList] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [filterType, setFilterType] = React.useState("all"); // 'all', 'food', 'drink'
  const navigate = useNavigate();
  const cateScrollRef = useRef(null);
  const shopScrollRef = useRef(null);

  useGetCategories();

  const handleFilterByCategory = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory("All");
    } else {
      setSelectedCategory(category);
    }
  }

  // Combined Filter Logic
  useEffect(() => {
    let result = itemsInMyCity || [];

    // Filter by Category
    if (selectedCategory !== "All") {
      result = result.filter((item) =>
        item?.category?._id === selectedCategory || item?.category?.name === selectedCategory
      );
    }

    // Filter by Type
    if (filterType !== "all") {
      result = result.filter(item => item.foodType === filterType);
    }

    setUpdatedItemsList(result);
  }, [itemsInMyCity, selectedCategory, filterType]);

  useEffect(() => {
    const handleWheel = (e) => {
      // ... existing scroll logic ...
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
    <div className='w-full min-h-screen bg-[#fff9f9] flex flex-col items-center gap-5 overflow-y-auto pb-10'>
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
                onClick={() => handleFilterByCategory(cate.name)}
                isSelected={selectedCategory === cate.name} // Optional: Pass selected prop if CategoryCard supports it to show active state
              />
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
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className='text-gray-800 text-2xl sm:text-3xl font-bold'>Món ăn gợi ý</h1>

          {/* Filter Buttons */}
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            <button
              onClick={() => setFilterType("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === 'all' ? 'bg-[#ff4d2d] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <FaLayerGroup /> Tất cả
            </button>
            <div className="w-[1px] bg-gray-200 my-1 mx-1"></div>
            <button
              onClick={() => setFilterType("food")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === 'food' ? 'bg-[#ff4d2d] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <FaUtensils /> Đồ ăn
            </button>
            <div className="w-[1px] bg-gray-200 my-1 mx-1"></div>
            <button
              onClick={() => setFilterType("drink")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === 'drink' ? 'bg-[#ff4d2d] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <FaGlassMartiniAlt /> Đồ uống
            </button>
          </div>
        </div>

        <div className='w-full h-auto flex flex-wrap gap-[20px] justify-center'>
          {updatedItemsList?.length > 0 ? (
            updatedItemsList.map((item, index) => (
              <FoodCard data={item} key={index} />
            ))
          ) : (
            <div className="w-full flex flex-col items-center justify-center py-10 text-gray-400">
              <p>Không tìm thấy món ăn nào phù hợp.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashBoard
