import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import axios from 'axios';
import toast from 'react-hot-toast';
import { serverUrl } from '../App';

function ReviewForm({ orderId, shopOrderId, shopName, hasDelivery, onClose, onSuccess }) {
    const [shopRating, setShopRating] = useState(0);
    const [deliveryRating, setDeliveryRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 2) {
            toast.error('Chỉ được tải lên tối đa 2 ảnh');
            return;
        }

        setImages(prev => [...prev, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (shopRating === 0) {
            toast.error('Vui lòng đánh giá quán ăn');
            return;
        }

        if (hasDelivery && deliveryRating === 0) {
            toast.error('Vui lòng đánh giá người giao hàng');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('orderId', orderId);
            formData.append('shopOrderId', shopOrderId);
            formData.append('shopRating', shopRating);
            if (hasDelivery) {
                formData.append('deliveryRating', deliveryRating);
            }
            formData.append('reviewText', reviewText);
            images.forEach(image => {
                formData.append('images', image);
            });

            await axios.post(`${serverUrl}/api/review/create`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Đánh giá thành công!');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Đánh giá thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    const StarRating = ({ rating, setRating, label }) => (
        <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                    >
                        <FaStar
                            size={32}
                            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
                        />
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-900">Đánh giá đơn hàng</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <IoClose size={28} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Quán: <span className="font-semibold">{shopName}</span></p>
                    </div>

                    <StarRating
                        rating={shopRating}
                        setRating={setShopRating}
                        label="Đánh giá quán ăn"
                    />

                    {hasDelivery && (
                        <StarRating
                            rating={deliveryRating}
                            setRating={setDeliveryRating}
                            label="Đánh giá người giao hàng"
                        />
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nhận xét (tùy chọn)
                        </label>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            maxLength={525}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                        />
                        <p className="text-xs text-gray-500 mt-1">{reviewText.length}/525 ký tự</p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Hình ảnh (tối đa 2 ảnh)
                        </label>
                        {imagePreviews.length < 2 && (
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
                            />
                        )}
                        {imagePreviews.length > 0 && (
                            <div className="flex gap-2 mt-3">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative">
                                        <img src={preview} alt={`Preview ${index + 1}`} className="w-24 h-24 object-cover rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                        >
                                            <IoClose size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ReviewForm;
