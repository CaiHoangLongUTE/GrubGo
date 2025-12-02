import React from 'react'

function ShopCard({ name, image, onClick }) {
  return (
    <div
      className='flex flex-col items-center gap-3 cursor-pointer group shrink-0 w-[110px] md:w-[160px] p-2 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300'
      onClick={onClick}
    >
      {/* Circular Image Container */}
      <div className='w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-white shadow-md overflow-hidden group-hover:shadow-xl transition-all duration-300'>
        <img src={image} alt={name} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' />
      </div>

      {/* Shop Name */}
      <div className='text-center w-full px-1'>
        <h3 className='text-gray-800 font-bold text-sm md:text-base truncate w-full group-hover:text-[#ff4d2d] transition-colors'>
          {name}
        </h3>
      </div>
    </div>
  )
}

export default ShopCard
