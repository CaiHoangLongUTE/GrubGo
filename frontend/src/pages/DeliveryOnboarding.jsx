import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaIdCard, FaCar, FaMotorcycle, FaBolt, FaSave } from 'react-icons/fa';
import { MdBadge } from "react-icons/md";
import axios from 'axios';
import toast from 'react-hot-toast';
import { setUserData } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';

function DeliveryOnboarding() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userData = useSelector(state => state.user.userData);

    const [formData, setFormData] = useState({
        typeOfVehicle: 'motorcycle',
        licensePlate: ''
    });

    const [citizenIdentityFront, setCitizenIdentityFront] = useState(null);
    const [citizenIdentityBack, setCitizenIdentityBack] = useState(null);
    const [driverLicenseFront, setDriverLicenseFront] = useState(null);
    const [driverLicenseBack, setDriverLicenseBack] = useState(null);

    const [previews, setPreviews] = useState({
        citizenIdentityFront: '',
        citizenIdentityBack: '',
        driverLicenseFront: '',
        driverLicenseBack: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userData) {
            navigate('/signin');
        } else if (userData.role !== 'delivery') {
            navigate('/');
        } else if (userData.status === 'active') {
            navigate('/'); // Already approved
        }
    }, [userData, navigate]);

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        if (fieldName === 'citizenIdentityFront') setCitizenIdentityFront(file);
        if (fieldName === 'citizenIdentityBack') setCitizenIdentityBack(file);
        if (fieldName === 'driverLicenseFront') setDriverLicenseFront(file);
        if (fieldName === 'driverLicenseBack') setDriverLicenseBack(file);

        const url = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, [fieldName]: url }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!citizenIdentityFront || !citizenIdentityBack || !driverLicenseFront || !driverLicenseBack || !formData.licensePlate) {
            return toast.error("Vui lòng điền đầy đủ thông tin và tải lên giấy tờ");
        }

        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('typeOfVehicle', formData.typeOfVehicle);
            submitData.append('licensePlate', formData.licensePlate);
            submitData.append('citizenIdentityFront', citizenIdentityFront);
            submitData.append('citizenIdentityBack', citizenIdentityBack);
            submitData.append('driverLicenseFront', driverLicenseFront);
            submitData.append('driverLicenseBack', driverLicenseBack);

            const result = await axios.put(`${serverUrl}/api/user/update-profile`, submitData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            dispatch(setUserData(result.data.user));
            toast.success('Gửi hồ sơ thành công! Vui lòng chờ Admin duyệt.');
            navigate('/');
            // Stay on this page to show the pending message
            window.scrollTo(0, 0);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi khi gửi hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    const renderFileInput = (label, fieldName, fileState, previewUrl) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} <span className="text-red-500">*</span></label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all hover:border-orange-400 hover:bg-orange-50 ${previewUrl ? 'border-orange-300 bg-orange-50/30' : 'border-gray-300'}`}>
                <div className="space-y-1 text-center relative w-full">
                    {previewUrl ? (
                        <div className="relative group/preview">
                            <img src={previewUrl} alt="Preview" className="mx-auto h-32 object-cover rounded-lg shadow-sm" />
                            {fileState && <p className="text-xs text-green-600 mt-2 font-semibold">Đã chọn</p>}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-sm text-center text-orange-600 font-medium">Tải ảnh lên</span>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange(e, fieldName)}
                        required={!previewUrl} // Required if no preview exists
                    />
                </div>
            </div>
        </div>
    );

    const handleLogout = async () => {
        try {
            await axios.post(`${serverUrl}/api/auth/signout`);
            dispatch(setUserData(null));
            navigate("/signin");
        } catch (error) {
            console.error("Logout failed", error);
        }
    }

    // If already submitted (has license plate), show pending status only
    if (userData?.licensePlate) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
                            <MdBadge className="h-8 w-8 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hồ sơ đang chờ duyệt</h2>
                        <p className="text-gray-600 mb-8">
                            Bạn đã gửi hồ sơ đăng ký. Vui lòng chờ quản trị viên xét duyệt.
                            Sau khi được duyệt, bạn sẽ có thể truy cập vào giao diện nhận đơn.
                        </p>
                        <button
                            onClick={handleLogout}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Hoàn thiện hồ sơ Tài xế
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Vui lòng cung cấp thông tin bên dưới để Admin duyệt tài khoản của bạn.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Vehicle Info */}
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2 border-b pb-2 mb-4">
                                <MdBadge className="text-[#ff4d2d]" /> Thông tin phương tiện
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại phương tiện</label>
                                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, typeOfVehicle: 'motorcycle' })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.typeOfVehicle === 'motorcycle' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
                                        >
                                            <FaMotorcycle /> Xe máy
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, typeOfVehicle: 'car' })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.typeOfVehicle === 'car' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
                                        >
                                            <FaCar /> Ô tô
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, typeOfVehicle: 'electric' })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.typeOfVehicle === 'electric' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
                                        >
                                            <FaBolt /> Xe điện
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Biển số xe <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.licensePlate}
                                        onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-500 focus:outline-none transition-all text-sm uppercase font-semibold"
                                        placeholder="VD: 43A-123.45"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2 border-b pb-2 mb-4">
                                <FaIdCard className="text-[#ff4d2d]" /> Giấy tờ tùy thân
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {renderFileInput('Mặt trước CCCD', 'citizenIdentityFront', citizenIdentityFront, previews.citizenIdentityFront)}
                                {renderFileInput('Mặt sau CCCD', 'citizenIdentityBack', citizenIdentityBack, previews.citizenIdentityBack)}
                            </div>

                            <h3 className="text-sm font-semibold text-gray-700 mb-4 mt-6">Giấy phép lái xe</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {renderFileInput('Mặt trước GPLX', 'driverLicenseFront', driverLicenseFront, previews.driverLicenseFront)}
                                {renderFileInput('Mặt sau GPLX', 'driverLicenseBack', driverLicenseBack, previews.driverLicenseBack)}
                            </div>
                        </div>

                        <div className="pt-5 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#ff4d2d] hover:bg-[#e64323] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                            >
                                {loading ? 'Đang gửi...' : 'Gửi hồ sơ duyệt'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default DeliveryOnboarding;
