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
      {/* Gradient Overlay - Darker at bottom for better text visibility */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent' />

      {/* Category Name */}
      <div className='absolute bottom-0 left-0 w-full p-4 text-center'>
        <span className='text-white font-bold text-base md:text-lg tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-[#ff4d2d] transition-colors duration-300'>
          {name}
        </span>
      </div>
    </div>
  )
}

export default CategoryCard
