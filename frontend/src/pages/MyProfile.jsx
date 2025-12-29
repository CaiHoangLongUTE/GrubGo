import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaUser, FaMale, FaFemale, FaCamera, FaSave, FaIdCard, FaCar, FaMotorcycle, FaBolt } from 'react-icons/fa';
import { MdBadge } from "react-icons/md";
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
        birthDay: '',
        typeOfVehicle: 'motorcycle',
        licensePlate: ''
    });

    // File States
    const [avatar, setAvatar] = useState(null);
    const [citizenIdentityFront, setCitizenIdentityFront] = useState(null);
    const [citizenIdentityBack, setCitizenIdentityBack] = useState(null);
    const [driverLicenseFront, setDriverLicenseFront] = useState(null);
    const [driverLicenseBack, setDriverLicenseBack] = useState(null);

    // Preview URLs
    const [avatarPreview, setAvatarPreview] = useState('');
    const [previews, setPreviews] = useState({
        citizenIdentityFront: '',
        citizenIdentityBack: '',
        driverLicenseFront: '',
        driverLicenseBack: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setFormData({
                fullName: userData.fullName || '',
                email: userData.email || '',
                mobile: userData.mobile || '',
                gender: userData.gender || 1,
                birthDay: userData.birthDay ? new Date(userData.birthDay).toISOString().split('T')[0] : '',
                typeOfVehicle: userData.typeOfVehicle || 'motorcycle',
                licensePlate: userData.licensePlate || ''
            });

            setAvatarPreview(userData.avatar || '');
            setPreviews({
                citizenIdentityFront: userData.citizenIdentityFront || '',
                citizenIdentityBack: userData.citizenIdentityBack || '',
                driverLicenseFront: userData.driverLicenseFront || '',
                driverLicenseBack: userData.driverLicenseBack || ''
            });
        }
    }, [userData]);

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        // Update file state
        if (fieldName === 'avatar') setAvatar(file);
        if (fieldName === 'citizenIdentityFront') setCitizenIdentityFront(file);
        if (fieldName === 'citizenIdentityBack') setCitizenIdentityBack(file);
        if (fieldName === 'driverLicenseFront') setDriverLicenseFront(file);
        if (fieldName === 'driverLicenseBack') setDriverLicenseBack(file);

        // Update preview
        const url = URL.createObjectURL(file);
        if (fieldName === 'avatar') {
            setAvatarPreview(url);
        } else {
            setPreviews(prev => ({ ...prev, [fieldName]: url }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('fullName', formData.fullName);
            submitData.append('mobile', formData.mobile);
            submitData.append('gender', formData.gender);
            if (formData.birthDay) submitData.append('birthDay', formData.birthDay);

            // Only append extra fields for specific roles to keep backend clean? 
            // Actually backend accepts them regardless, but logic-wise:
            if (userData.role === 'delivery') {
                submitData.append('typeOfVehicle', formData.typeOfVehicle);
                submitData.append('licensePlate', formData.licensePlate);
            }

            if (avatar) submitData.append('avatar', avatar);
            if (citizenIdentityFront) submitData.append('citizenIdentityFront', citizenIdentityFront);
            if (citizenIdentityBack) submitData.append('citizenIdentityBack', citizenIdentityBack);
            if (driverLicenseFront) submitData.append('driverLicenseFront', driverLicenseFront);
            if (driverLicenseBack) submitData.append('driverLicenseBack', driverLicenseBack);

            const result = await axios.put(`${serverUrl}/api/user/update-profile`, submitData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

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

    const renderFileInput = (label, fieldName, fileState, previewUrl) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl transition-all hover:border-orange-400 hover:bg-orange-50 ${previewUrl ? 'border-orange-300 bg-orange-50/30' : ''}`}>
                <div className="space-y-1 text-center relative w-full">
                    {previewUrl ? (
                        <div className="relative group/preview">
                            <img src={previewUrl} alt="Preview" className="mx-auto h-32 object-cover rounded-lg shadow-sm" />
                            {fileState && <p className="text-xs text-green-600 mt-2 font-semibold">Tệp mới đã chọn</p>}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-600 justify-center">
                                <span className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                                    <span>Tải ảnh lên</span>
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, PDF</p>
                        </div>
                    )}
                    <input
                        id={fieldName}
                        name={fieldName}
                        type="file"
                        accept="image/*, application/pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange(e, fieldName)}
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className='flex items-center gap-4 mb-8 cursor-pointer group w-fit' onClick={() => navigate("/")}>
                    <div className="p-2 bg-white rounded-full shadow-sm text-gray-600 group-hover:bg-orange-500 group-hover:text-white transition-all">
                        <IoArrowBack size={24} />
                    </div>
                    <h1 className='text-2xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors'>Hồ sơ cá nhân</h1>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: General Info */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
                                <FaUser className="text-[#ff4d2d]" />
                                Thông tin chung
                            </h2>

                            <div className="flex flex-col items-center mb-8">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 ring-2 ring-gray-100">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-400 text-white text-4xl font-bold">
                                                {formData.fullName?.slice(0, 1).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute bottom-1 right-1 bg-white text-gray-700 p-2.5 rounded-full cursor-pointer hover:bg-orange-50 hover:text-orange-600 transition-all shadow-md border border-gray-200 group-hover:scale-110">
                                        <FaCamera size={16} />
                                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" />
                                    </label>
                                </div>
                                <p className="mt-3 text-sm text-gray-500 font-medium">Ảnh đại diện</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 focus:outline-none transition-all text-sm"
                                        placeholder="Nhập họ và tên"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 focus:outline-none transition-all text-sm"
                                        placeholder="Nhập số điện thoại"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày sinh</label>
                                    <input
                                        type="date"
                                        value={formData.birthDay}
                                        onChange={(e) => setFormData({ ...formData, birthDay: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 focus:outline-none transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: 1 })}
                                            className={`flex-1 py-2.5 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 text-sm font-medium ${formData.gender === 1
                                                ? 'border-blue-500 bg-blue-50 text-blue-600 ring-1 ring-blue-500'
                                                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                                }`}
                                        >
                                            <FaMale className="text-lg" /> Nam
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: 2 })}
                                            className={`flex-1 py-2.5 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 text-sm font-medium ${formData.gender === 2
                                                ? 'border-pink-500 bg-pink-50 text-pink-600 ring-1 ring-pink-500'
                                                : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                                }`}
                                        >
                                            <FaFemale className="text-lg" /> Nữ
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-100 lg:block hidden">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#ff4d2d] text-white py-3.5 rounded-xl font-bold text-base hover:shadow-lg hover:bg-[#e64323] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-orange-200"
                                >
                                    <FaSave />
                                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Identity & Vehicle Info */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Identity Card Section - For Owner & Delivery */}
                        {(userData?.role === 'owner' || userData?.role === 'delivery') && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
                                    <FaIdCard className="text-[#ff4d2d]" />
                                    Căn cước công dân (CCCD)
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {renderFileInput('Mặt trước CCCD', 'citizenIdentityFront', citizenIdentityFront, previews.citizenIdentityFront)}
                                    {renderFileInput('Mặt sau CCCD', 'citizenIdentityBack', citizenIdentityBack, previews.citizenIdentityBack)}
                                </div>
                            </div>
                        )}

                        {/* Vehicle & License Section - Only for Delivery Person */}
                        {userData?.role === 'delivery' && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
                                    <MdBadge className="text-[#ff4d2d] text-xl" />
                                    Thông tin xe & Bằng lái
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại phương tiện</label>
                                        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, typeOfVehicle: 'motorcycle' })}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.typeOfVehicle === 'motorcycle'
                                                    ? 'bg-white text-orange-600 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                <FaMotorcycle /> Xe máy
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, typeOfVehicle: 'car' })} // Assuming 'car' is valid, or you might not support it yet
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.typeOfVehicle === 'car' || formData.typeOfVehicle === 'truck'
                                                    ? 'bg-white text-orange-600 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                <FaCar /> Ô tô
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, typeOfVehicle: 'electric' })}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.typeOfVehicle === 'electric'
                                                    ? 'bg-white text-orange-600 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                <FaBolt /> Xe điện
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Biển số xe</label>
                                        <input
                                            type="text"
                                            value={formData.licensePlate}
                                            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 focus:outline-none transition-all text-sm uppercase font-semibold tracking-wider placeholder:normal-case placeholder:font-normal"
                                            placeholder="VD: 43A-123.45"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {renderFileInput('Mặt trước GPLX', 'driverLicenseFront', driverLicenseFront, previews.driverLicenseFront)}
                                    {renderFileInput('Mặt sau GPLX', 'driverLicenseBack', driverLicenseBack, previews.driverLicenseBack)}
                                </div>
                            </div>
                        )}

                        {/* Mobile Submit Button (Visible only on small screens) */}
                        <div className="lg:hidden block pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#ff4d2d] text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:bg-[#e64323] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-orange-200"
                            >
                                <FaSave />
                                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MyProfile;