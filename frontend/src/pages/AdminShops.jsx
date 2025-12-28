import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import toast from 'react-hot-toast';
import { translateShopStatus, getShopStatusColor } from '../utils/statusTranslator';

const AdminShops = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'active' | 'disabled' | 'rejected'

    // Custom Confirm Modal State
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        shopId: null,
        status: null,
        message: ''
    });

    useEffect(() => {
        fetchShops();
    }, [activeTab]);

    const fetchShops = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            params.append('status', activeTab);

            const res = await axios.get(`${serverUrl}/api/admin/shops?${params}`, { withCredentials: true });
            setShops(res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Không thể tải shops");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchShops();
    };

    // Trigger Notification/Modal
    const handleUpdateStatus = (shopId, status) => {
        setConfirmModal({
            show: true,
            shopId,
            status,
            message: `Bạn có chắc muốn chuyển trạng thái thành "${translateShopStatus(status)}"?`
        });
    };

    // Actual Action
    const confirmAction = async () => {
        const { shopId, status } = confirmModal;
        if (!shopId) return;

        try {
            await axios.patch(`${serverUrl}/api/admin/shops/${shopId}/status`, { status }, { withCredentials: true });
            toast.success("Cập nhật trạng thái thành công");
            fetchShops();
        } catch (error) {
            toast.error(error.response?.data?.message || "Cập nhật thất bại");
        } finally {
            setConfirmModal({ show: false, shopId: null, status: null, message: '' });
        }
    };

    const closeConfirmModal = () => {
        setConfirmModal({ show: false, shopId: null, status: null, message: '' });
    };

    if (loading) {
        return <div className="p-8"><div className="animate-pulse text-gray-500">Đang tải...</div></div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý quán ăn</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                {['pending', 'active', 'disabled', 'rejected'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 font-medium capitalize transition-colors border-b-2 ${activeTab === tab
                            ? 'border-[#ff4d2d] text-[#ff4d2d]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {translateShopStatus(tab)}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Tìm kiếm quán ăn..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
                    />
                    <button type="submit" className="px-6 py-2 bg-[#ff4d2d] text-white rounded-lg hover:bg-[#e63c1d]">
                        Tìm
                    </button>
                </form>
            </div>

            {/* Shops Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shops.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-10">Không có quán ăn nào.</div>
                ) : (
                    shops.map((shop) => (
                        <div key={shop._id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col">
                            <img src={shop.image} alt={shop.name} className="w-full h-48 object-cover" />
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{shop.name}</h3>
                                <p className="text-sm text-gray-500 mb-1"><span className="font-medium">Chủ quán:</span> {shop.owner?.fullName}</p>
                                <p className="text-sm text-gray-500 mb-1"><span className="font-medium">Thành phố:</span> {shop.state || shop.city}</p>

                                <div className="mt-4 mb-4 space-y-2">
                                    <h4 className="font-medium text-sm text-gray-700">Giấy tờ pháp lý:</h4>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {shop.businessLicense ? (
                                            <a href={shop.businessLicense} target="_blank" rel="noreferrer" className="text-blue-600 underline">Kinh doanh</a>
                                        ) : <span className="text-red-400">Thiếu GPKD</span>}

                                        {shop.foodSafetyLicense ? (
                                            <a href={shop.foodSafetyLicense} target="_blank" rel="noreferrer" className="text-blue-600 underline">ATTP</a>
                                        ) : <span className="text-red-400">Thiếu ATTP</span>}

                                        {shop.firePreventionLicense ? (
                                            <a href={shop.firePreventionLicense} target="_blank" rel="noreferrer" className="text-blue-600 underline">PCCC</a>
                                        ) : <span className="text-red-400">Thiếu PCCC</span>}
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getShopStatusColor(shop.status)}`}>
                                        {translateShopStatus(shop.status)}
                                    </span>

                                    <div className="flex gap-2">
                                        {shop.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(shop._id, 'active')}
                                                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                                >
                                                    Duyệt
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(shop._id, 'rejected')}
                                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                                >
                                                    Từ chối
                                                </button>
                                            </>
                                        )}
                                        {shop.status === 'active' && (
                                            <button
                                                onClick={() => handleUpdateStatus(shop._id, 'disabled')}
                                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                                            >
                                                Khóa
                                            </button>
                                        )}
                                        {(shop.status === 'disabled' || shop.status === 'rejected') && (
                                            <button
                                                onClick={() => handleUpdateStatus(shop._id, 'active')}
                                                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                            >
                                                Mở lại
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* Custom Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                                <svg className="h-6 w-6 text-[#ff4d2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận hành động</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {confirmModal.message}
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={closeConfirmModal}
                                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmAction}
                                    className="px-5 py-2.5 bg-[#ff4d2d] hover:bg-[#e63c1d] text-white font-medium rounded-xl shadow-lg shadow-orange-200 transition-colors"
                                >
                                    Đồng ý
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShops;
