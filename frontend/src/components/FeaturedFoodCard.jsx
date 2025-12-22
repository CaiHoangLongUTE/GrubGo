import React from 'react';
import { useNavigate } from 'react-router-dom';

function FeaturedFoodCard({ food }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate('/signup')}
            className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-2"
        >
            {/* Image */}
            <div className="relative h-56 overflow-hidden bg-gray-100">
                <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=400&fit=crop';
                    }}
                />
                <div className="absolute top-4 right-4 bg-[#ff4d2d] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(food.price)}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-3">
                <h3 className="font-bold text-xl text-gray-800 group-hover:text-[#ff4d2d] transition-colors line-clamp-1">
                    {food.name}
                </h3>

                {food.shop && (
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                        <span className="text-[#ff4d2d]">🏪</span>
                        <span className="truncate">{food.shop.name || food.shop}</span>
                    </p>
                )}

                {food.category && (
                    <span className="inline-block text-xs bg-orange-50 text-[#ff4d2d] px-3 py-1 rounded-full font-medium">
                        {food.category.name || food.category}
                    </span>
                )}

                <button className="w-full bg-orange-50 text-[#ff4d2d] py-3 rounded-xl font-semibold hover:bg-[#ff4d2d] hover:text-white transition-all">
                    Đặt ngay
                </button>
            </div>
        </div>
    );
}

export default FeaturedFoodCard;
