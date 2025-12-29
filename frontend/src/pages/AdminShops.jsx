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

    // Detail Modal State
    const [selectedShop, setSelectedShop] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const openDetailModal = (shop) => {
        setSelectedShop(shop);
        setIsDetailOpen(true);
    };

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
                        <div key={shop._id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col group hover:shadow-lg transition-all">
                            <div className="relative h-48">
                                <img src={shop.image} alt={shop.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => openDetailModal(shop)}
                                        className="bg-white text-blue-600 px-4 py-2 rounded-full font-bold shadow-lg hover:bg-gray-100 transform translate-y-2 group-hover:translate-y-0 transition-all"
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate" title={shop.name}>{shop.name}</h3>
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
            {/* Shop Detail Modal */}
            {isDetailOpen && selectedShop && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Chi tiết quán ăn</h3>
                            <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Header Info */}
                            <div className="flex flex-col md:flex-row gap-6 mb-8">
                                <img src={selectedShop.image} alt={selectedShop.name} className="w-full md:w-48 h-48 object-cover rounded-xl shadow-sm border border-gray-100" />
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">{selectedShop.name}</h2>
                                        <p className="text-gray-500">{selectedShop.address}, {selectedShop.commune}, {selectedShop.district}, {selectedShop.city}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm mt-4">
                                        <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                            <span className="block text-xs text-gray-400 uppercase font-semibold">Chủ quán</span>
                                            <span className="font-semibold text-gray-800">{selectedShop.owner?.fullName}</span>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                            <span className="block text-xs text-gray-400 uppercase font-semibold">Liên hệ</span>
                                            <span className="font-semibold text-gray-800">{selectedShop.owner?.mobile || selectedShop.owner?.email}</span>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                            <span className="block text-xs text-gray-400 uppercase font-semibold">Trạng thái</span>
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getShopStatusColor(selectedShop.status)}`}>
                                                {translateShopStatus(selectedShop.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-4 border-l-4 border-[#ff4d2d] pl-3">Hồ sơ pháp lý</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Giấy phép kinh doanh', file: selectedShop.businessLicense },
                                        { label: 'Chứng nhận ATTP', file: selectedShop.foodSafetyLicense },
                                        { label: 'PCCC', file: selectedShop.firePreventionLicense }
                                    ].map((doc, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <p className="text-sm font-semibold text-gray-700">{doc.label}</p>
                                            <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-[4/3] flex items-center justify-center">
                                                {doc.file ? (
                                                    (typeof doc.file === 'string' && doc.file.endsWith('.pdf')) ? (
                                                        <a href={doc.file} target="_blank" rel="noreferrer" className="flex flex-col items-center p-4 text-gray-600 hover:text-[#ff4d2d] transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="text-xs font-bold">Xem PDF</span>
                                                        </a>
                                                    ) : (
                                                        <>
                                                            <img src={doc.file} alt={doc.label} className="w-full h-full object-contain" />
                                                            <a href={doc.file} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="text-white font-bold bg-black/50 px-3 py-1 rounded-full text-sm">Xem phóng to</span>
                                                            </a>
                                                        </>
                                                    )
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Chưa cập nhật</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => setIsDetailOpen(false)}
                                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Đóng
                            </button>
                            {selectedShop.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => { handleUpdateStatus(selectedShop._id, 'rejected'); setIsDetailOpen(false); }}
                                        className="px-5 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
                                    >
                                        Từ chối
                                    </button>
                                    <button
                                        onClick={() => { handleUpdateStatus(selectedShop._id, 'active'); setIsDetailOpen(false); }}
                                        className="px-5 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 shadow-lg shadow-green-200 transition-colors"
                                    >
                                        Duyệt ngay
                                    </button>
                                </>
                            )}
                            {(selectedShop.status === 'disabled' || selectedShop.status === 'rejected') && (
                                <button
                                    onClick={() => { handleUpdateStatus(selectedShop._id, 'active'); setIsDetailOpen(false); }}
                                    className="px-5 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 shadow-lg shadow-green-200 transition-colors"
                                >
                                    Mở lại hoạt động
                                </button>
                            )}
                            {selectedShop.status === 'active' && (
                                <button
                                    onClick={() => { handleUpdateStatus(selectedShop._id, 'disabled'); setIsDetailOpen(false); }}
                                    className="px-5 py-2.5 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-700 shadow-lg shadow-gray-200 transition-colors"
                                >
                                    Khóa quán
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
