import React from 'react';
import { FaStar } from 'react-icons/fa';

function ReviewCard({ review }) {
    const renderStars = (rating) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <FaStar
                        key={star}
                        size={16}
                        className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 overflow-hidden">
                    {review.user?.avatar ? (
                        <img src={review.user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        review.user?.fullName?.charAt(0).toUpperCase() || 'U'
                    )}
                </div>

                <div className="flex-1">
                    <p className="font-semibold text-gray-900">{review.user?.fullName || 'Người dùng'}</p>
                    <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Quán ăn:</span>
                    {renderStars(review.shopRating)}
                </div>
            </div>

            {review.reviewText && (
                <p className="text-gray-700 text-sm mb-3">{review.reviewText}</p>
            )}

            {review.images && review.images.length > 0 && (
                <div className="flex gap-2">
                    {review.images.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`Review ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default ReviewCard;
