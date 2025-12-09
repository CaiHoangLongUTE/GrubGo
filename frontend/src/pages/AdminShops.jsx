import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import toast from 'react-hot-toast';

const AdminShops = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);

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

    const handleUpdateStatus = async (shopId, status) => {
        try {
            await axios.patch(`${serverUrl}/api/admin/shops/${shopId}/status`, { status }, { withCredentials: true });
            toast.success("Cập nhật trạng thái thành công");
            fetchShops();
        } catch (error) {
            toast.error(error.response?.data?.message || "Cập nhật thất bại");
        }
    };

    if (loading) {
        return <div className="p-8"><div className="animate-pulse text-gray-500">Đang tải...</div></div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý Shops</h1>

            {/* Search */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Tìm kiếm shop..."
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
                {shops.map((shop) => (
                    <div key={shop._id} className="bg-white rounded-lg shadow overflow-hidden">
                        <img src={shop.image} alt={shop.name} className="w-full h-48 object-cover" />
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{shop.name}</h3>
                            <p className="text-sm text-gray-500 mb-1"><span className="font-medium">Chủ quán:</span> {shop.owner?.fullName}</p>
                            <p className="text-sm text-gray-500 mb-1"><span className="font-medium">Thành phố:</span> {shop.state}, {shop.city}</p>
                            <p className="text-sm text-gray-500 mb-3"><span className="font-medium">Địa chỉ:</span> {shop.address}</p>
                            {shop.hotline && <p className="text-sm text-gray-500 mb-1"><span className="font-medium">Hotline:</span> {shop.hotline}</p>}
                            <p className="text-sm text-gray-500 mb-3"><span className="font-medium">Giờ mở cửa:</span> {shop.openTime || "08:00"} - {shop.closeTime || "22:00"}</p>

                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${shop.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {shop.status || 'active'}
                                </span>

                                {shop.status === 'active' ? (
                                    <button
                                        onClick={() => handleUpdateStatus(shop._id, 'disabled')}
                                        className="px-4 py-2 text-sm text-red-600 hover:text-red-900"
                                    >
                                        Disable
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUpdateStatus(shop._id, 'active')}
                                        className="px-4 py-2 text-sm text-green-600 hover:text-green-900"
                                    >
                                        Enable
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminShops;
