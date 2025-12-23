import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMotorcycle, FaUtensils, FaCreditCard, FaArrowRight } from "react-icons/fa6";
import axios from 'axios';
import { serverUrl } from '../App';
import FeaturedFoodCard from '../components/FeaturedFoodCard';

const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop";

const Landing = () => {
    const navigate = useNavigate();
    const [featuredFoods, setFeaturedFoods] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch featured items from API
    useEffect(() => {
        const fetchFeaturedItems = async () => {
            try {
                setLoading(true);
                const result = await axios.get(`${serverUrl}/api/item/featured-items`);
                setFeaturedFoods(result.data);
            } catch (error) {
                console.error('Error fetching featured items:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeaturedItems();
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Navbar Overlay */}
            <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-6 md:px-12">
                <div className="text-3xl font-extrabold text-[#ff4d2d] tracking-tighter">GrubGo</div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/signin')}
                        className="text-white font-medium hover:text-orange-200 transition-colors"
                    >
                        Đăng nhập
                    </button>
                    <button
                        onClick={() => navigate('/signup')}
                        className="bg-[#ff4d2d] text-white px-5 py-2.5 rounded-full font-bold shadow-lg hover:bg-[#ff330f] transition-all transform hover:scale-105 active:scale-95"
                    >
                        Đăng ký ngay
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative w-full h-screen flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={HERO_IMAGE_URL}
                        alt="Delicious Food"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80" />
                </div>

                {/* Content */}
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight drop-shadow-2xl animate-fade-in-up">
                        Món Ngon <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d2d] to-yellow-400">
                            Trao Tận Tay
                        </span>
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-200 mb-10 font-light max-w-2xl mx-auto leading-relaxed">
                        Khám phá hàng ngàn món ăn từ những nhà hàng tốt nhất xung quanh bạn. Giao hàng nhanh chóng, hương vị tuyệt vời.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full sm:w-auto px-8 py-4 bg-[#ff4d2d] text-white text-lg font-bold rounded-full shadow-orange-500/30 shadow-xl hover:bg-[#ff330f] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                        >
                            Đặt Món Ngay <FaArrowRight />
                        </button>
                        <button
                            onClick={() => navigate('/signin')}
                            className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white text-lg font-bold rounded-full hover:bg-white/20 transition-all"
                        >
                            Đã có tài khoản?
                        </button>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-24 bg-gray-50 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[#ff4d2d] font-bold tracking-wider uppercase text-sm mb-2 block">Tại sao chọn GrubGo?</span>
                        <h2 className="text-4xl font-bold text-gray-900">Dịch vụ vượt trội</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Feature 1 */}
                        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-orange-100 text-[#ff4d2d] rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                <FaMotorcycle />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-800">Giao Hàng Siêu Tốc</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Cam kết giao hàng đúng giờ. Đội ngũ tài xế chuyên nghiệp đảm bảo món ăn đến tay bạn vẫn còn nóng hổi.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                <FaUtensils />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-800">Đa Dạng Món Ăn</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Hàng ngàn nhà hàng và quán ăn từ bình dân đến cao cấp, đáp ứng mọi khẩu vị của bạn.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                <FaCreditCard />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-800">Thanh Toán Dễ Dàng</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Hỗ trợ nhiều phương thức thanh toán an toàn, tiện lợi. Tích điểm đổi quà hấp dẫn.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Foods Section */}
            <section className="py-24 bg-white px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[#ff4d2d] font-bold tracking-wider uppercase text-sm mb-2 block">Món ăn nổi bật</span>
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Khám Phá Món Ngon</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Những món ăn được yêu thích nhất từ các nhà hàng hàng đầu
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            // Loading skeleton
                            [...Array(6)].map((_, index) => (
                                <div key={index} className="bg-white rounded-3xl shadow-xl overflow-hidden animate-pulse">
                                    <div className="h-56 bg-gray-200"></div>
                                    <div className="p-6 space-y-3">
                                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-10 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            ))
                        ) : featuredFoods.length > 0 ? (
                            featuredFoods.map((food) => (
                                <FeaturedFoodCard key={food._id} food={food} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20">
                                <p className="text-gray-400 text-lg">Chưa có món ăn nào</p>
                            </div>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">Muốn xem thêm món ngon?</p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-8 py-4 bg-[#ff4d2d] text-white text-lg font-bold rounded-full shadow-lg hover:bg-[#ff330f] transition-all hover:shadow-xl"
                        >
                            Đăng ký để Khám Phá Thêm
                        </button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-[#ff4d2d] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Sẵn sàng thưởng thức món ngon?</h2>
                    <p className="text-orange-100 text-xl mb-10 max-w-2xl mx-auto">
                        Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt cho đơn hàng đầu tiên của bạn.
                    </p>
                    <button
                        onClick={() => navigate('/signup')}
                        className="bg-white text-[#ff4d2d] px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:bg-gray-100 transition-all transform hover:scale-105"
                    >
                        Bắt Đầu Ngay
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-2xl font-bold text-[#ff4d2d]">GrubGo</div>
                    <div className="text-gray-400 text-sm">
                        © 2026 GrubGo. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-sm font-medium text-gray-300">
                        <a href="#" className="hover:text-white transition-colors">Về chúng tôi</a>
                        <a href="#" className="hover:text-white transition-colors">Điều khoản</a>
                        <a href="#" className="hover:text-white transition-colors">Riêng tư</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
