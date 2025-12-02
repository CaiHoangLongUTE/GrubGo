import React from 'react'

function CategoryCard({ name, image, onClick }) {
  return (
    <div className='group relative w-[120px] h-[120px] md:w-[180px] md:h-[180px] rounded-2xl shrink-0 overflow-hidden 
    cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:z-20 hover:-translate-y-2 origin-center' onClick={onClick}>
      <img
        src={image}
        alt={name}
        className='w-full h-full object-cover'
      />
      {/* Gradient Overlay */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300' />

      {/* Text */}
      <div className='absolute bottom-0 left-0 w-full p-3 text-center'>
        <span className='text-white font-semibold text-sm md:text-base tracking-wide drop-shadow-md group-hover:text-[#ff4d2d] transition-colors duration-300'>
          {name}
        </span>
      </div>
    </div>
  )
}

export default CategoryCard
