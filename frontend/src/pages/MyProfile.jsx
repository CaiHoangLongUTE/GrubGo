import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaUser, FaMale, FaFemale, FaCamera, FaSave } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { setUserData } from '../redux/userSlice';
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';

function MyProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userData = useSelector(state => state.user.userData);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        gender: 1,
        avatar: ''
    });
    const [avatarPreview, setAvatarPreview] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setFormData({
                fullName: userData.fullName || '',
                email: userData.email || '',
                mobile: userData.mobile || '',
                gender: userData.gender || 1,
                avatar: userData.avatar || ''
            });
            setAvatarPreview(userData.avatar || '');
        }
    }, [userData]);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataImg = new FormData();
        formDataImg.append('image', file);

        try {
            const result = await axios.post(`${serverUrl}/api/user/upload-avatar`, formDataImg, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFormData(prev => ({ ...prev, avatar: result.data.url }));
            setAvatarPreview(result.data.url);
            setAvatarPreview(result.data.url);
            toast.success('Cập nhật ảnh đại diện thành công');
        } catch (error) {
            toast.error('Lỗi khi tải ảnh lên');
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await axios.put(`${serverUrl}/api/user/update-profile`, formData, {
                withCredentials: true
            });

            dispatch(setUserData(result.data.user));
            dispatch(setUserData(result.data.user));
            toast.success('Cập nhật hồ sơ thành công');
            navigate("/");
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi cập nhật hồ sơ');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-xl mx-auto">
                <div className='flex items-center gap-4 mb-6 cursor-pointer group w-fit' onClick={() => navigate("/")}>
                    <div className="p-2 bg-white rounded-full shadow-sm text-gray-600 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <IoArrowBack size={20} />
                    </div>
                    <span className="font-semibold text-gray-600 group-hover:text-orange-600 transition-colors">Quay lại</span>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6 text-center">
                        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                            <FaUser className="text-orange-100" />
                            Thông tin cá nhân
                        </h1>
                        <p className="text-orange-100 text-sm mt-1">Quản lý thông tin hồ sơ của bạn</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center mb-8 -mt-16">
                            <div className="relative">
                                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-400 text-white text-4xl font-bold">
                                            {formData.fullName?.slice(0, 1).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-1 right-1 bg-gray-800 text-white p-2 rounded-full cursor-pointer hover:bg-gray-900 transition-all shadow-md border-2 border-white">
                                    <FaCamera size={14} />
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-5">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-500 focus:outline-none transition-all text-sm"
                                    placeholder="Nhập họ và tên của bạn"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                                />
                            </div>

                            {/* Mobile */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-500 focus:outline-none transition-all text-sm"
                                    placeholder="Nhập số điện thoại"
                                    required
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Giới tính</label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gender: 1 })}
                                        className={`flex-1 py-2.5 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 text-sm font-medium ${formData.gender === 1
                                            ? 'border-blue-500 bg-blue-50 text-blue-600 ring-1 ring-blue-500'
                                            : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                            }`}
                                    >
                                        <FaMale className="text-lg" />
                                        Nam
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gender: 2 })}
                                        className={`flex-1 py-2.5 px-4 rounded-lg border transition-all flex items-center justify-center gap-2 text-sm font-medium ${formData.gender === 2
                                            ? 'border-pink-500 bg-pink-50 text-pink-600 ring-1 ring-pink-500'
                                            : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                            }`}
                                    >
                                        <FaFemale className="text-lg" />
                                        Nữ
                                    </button>

                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-8 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-bold hover:shadow-lg hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <FaSave />
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default MyProfile;