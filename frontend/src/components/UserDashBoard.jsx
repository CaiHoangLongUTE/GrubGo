import React, { useEffect, useRef } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import { useSelector } from 'react-redux';
import ShopCard from './ShopCard';

function UserDashBoard() {
  const { currentCity, shopsInMyCity } = useSelector((state) => state.user);
  const cateScrollRef = useRef(null);
  const shopScrollRef = useRef(null);

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
      {/* Category */}
      <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>Inspiration for your first order</h1>
        <div className='w-full'>
          <div ref={cateScrollRef} className='w-full flex overflow-x-auto gap-4 pb-2'>
            {categories.map((cate, index) => (
              <CategoryCard name={cate.category} image={cate.image} key={index} />
            ))}
          </div>
        </div>
      </div>
      {/* Shops in my city */}
      <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>Best shop in {currentCity}</h1>
        <div className='w-full'>
          <div ref={shopScrollRef} className='w-full flex overflow-x-auto gap-4 pb-2'>
            {shopsInMyCity.map((shop, index) => (
              <ShopCard name={shop.name} image={shop.image} key={index} />
            ))}
          </div>
        </div>
      </div>
      {/* Food List */}
      <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>Best food suggestions</h1>
        {/* <div className='w-full'>
          <div ref={shopScrollRef} className='w-full flex overflow-x-auto gap-4 pb-2'>
            {shopsInMyCity.map((shop, index) => (
              <ShopCard name={shop.name} image={shop.image} key={index} />
            ))}
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default UserDashBoard
