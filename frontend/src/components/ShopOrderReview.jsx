import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';
import { serverUrl } from '../App';

const ShopOrderReview = ({ shopOrderId }) => {
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/review/by-shop-order/${shopOrderId}`, { withCredentials: true });
                setReview(res.data);
            } catch (error) {
                console.error("Failed to fetch review", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReview();
    }, [shopOrderId]);

    if (loading) return <div className="text-gray-500 text-sm">Đang tải đánh giá...</div>;
    if (!review) return null;

    const renderStars = (rating) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <FaStar key={star} size={14} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'} />
            ))}
        </div>
    );

    return (
        <div className="mt-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-800 text-sm mb-2">Đánh giá của bạn:</h4>

            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Quán ăn:</span>
                {renderStars(review.shopRating)}
            </div>

            {review.deliveryRating && (
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Tài xế:</span>
                    {renderStars(review.deliveryRating)}
                </div>
            )}

            {review.reviewText && (
                <p className="text-sm text-gray-700 italic bg-gray-50 p-2 rounded-lg border border-gray-100">
                    {review.reviewText}
                </p>
            )}

            {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-2">
                    {review.images.map((img, idx) => (
                        <img key={idx} src={img} alt="review" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShopOrderReview;
