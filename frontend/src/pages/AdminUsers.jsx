import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import toast from 'react-hot-toast';
import { FaSearch, FaEye, FaCheck, FaTimes, FaBan, FaUnlock, FaUser, FaStore, FaMotorcycle, FaExclamationTriangle } from 'react-icons/fa';
import { translateUserStatus, getUserStatusColor } from '../utils/statusTranslator';

const AdminUsers = () => {
    const [activeTab, setActiveTab] = useState('user'); // 'user', 'owner', 'delivery'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    // Driver Approval Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState({ type: '', userId: '' });

    useEffect(() => {
        fetchUsers();
    }, [activeTab]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('role', activeTab);
            if (search) params.append('search', search);

            // For delivery tab, we might want to see all statuses including pending
            // The backend defaults might filter, but let's be explicit if needed
            // Our backend getAllUsers filters by role correctly.

            const res = await axios.get(`${serverUrl}/api/admin/users?${params}`, { withCredentials: true });

            // Client-side sorting: Pending drivers first if in delivery tab
            let data = res.data;
            if (activeTab === 'delivery') {
                data.sort((a, b) => {
                    if (a.status === 'pending' && b.status !== 'pending') return -1;
                    if (a.status !== 'pending' && b.status === 'pending') return 1;
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
            }

            setUsers(data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Không thể tải danh sách");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    // Action Handlers
    const openConfirmModal = (type, userId) => {
        setConfirmAction({ type, userId });
        setIsConfirmOpen(true);
    };

    const handleAction = async () => {
        const { type, userId } = confirmAction;
        let newStatus = '';

        switch (type) {
            case 'approve': newStatus = 'active'; break;
            case 'reject': newStatus = 'rejected'; break;
            case 'ban': newStatus = 'banned'; break;
            case 'unban': newStatus = 'active'; break;
            default: return;
        }

        try {
            await axios.patch(`${serverUrl}/api/admin/users/${userId}/status`, { status: newStatus }, {
                withCredentials: true
            });
            toast.success("Cập nhật trạng thái thành công");
            fetchUsers();
            setIsConfirmOpen(false);
            if (isModalOpen) setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi cập nhật trạng thái");
        }
    };

    const tabs = [
        { id: 'user', label: 'Khách hàng', icon: <FaUser /> },
        { id: 'owner', label: 'Chủ quán', icon: <FaStore /> },
        { id: 'delivery', label: 'Tài xế', icon: <FaMotorcycle /> },
    ];

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý người dùng</h1>

            {/* Tabs & Search Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center p-2 gap-4">
                    <div className="flex bg-gray-100/50 p-1 rounded-xl w-full md:w-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all flex-1 md:flex-none justify-center ${activeTab === tab.id
                                    ? 'bg-white text-orange-600 shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 hover:bg-gray-200/50'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, SĐT..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-sm"
                        />
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </form>
                </div>
            </div>

            {/* Table or Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                                <th className="px-6 py-4 font-semibold">Người dùng</th>
                                <th className="px-6 py-4 font-semibold">Liên hệ</th>
                                {activeTab === 'delivery' && <th className="px-6 py-4 font-semibold">Thông tin xe</th>}
                                <th className="px-6 py-4 font-semibold">Ngày tham gia</th>
                                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-12 text-gray-500">Đang tải dữ liệu...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-12 text-gray-500">Không tìm thấy người dùng nào.</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <span className="text-sm font-bold text-gray-400">{user.fullName?.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{user.fullName}</p>
                                                    <p className="text-xs text-gray-500 font-mono">#{user._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <p>{user.email}</p>
                                            <p>{user.mobile}</p>
                                        </td>
                                        {activeTab === 'delivery' && (
                                            <td className="px-6 py-4 text-sm">
                                                <p className="font-medium text-gray-800">{user.typeOfVehicle === 'motorcycle' ? 'Xe máy' : user.typeOfVehicle}</p>
                                                <p className="text-xs bg-gray-100 inline-block px-1.5 py-0.5 rounded text-gray-600 border border-gray-200 font-mono mt-1 uppercase">{user.licensePlate || 'N/A'}</p>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUserStatusColor(user.status)}`}>
                                                {translateUserStatus(user.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Xem hồ sơ"
                                                >
                                                    <FaEye />
                                                </button>


                                                {/* Status Actions */}
                                                {user.status === 'pending' ? (
                                                    <>
                                                        <button onClick={() => openConfirmModal('approve', user._id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Duyệt"><FaCheck /></button>
                                                        <button onClick={() => openConfirmModal('reject', user._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Từ chối"><FaTimes /></button>
                                                    </>
                                                ) : user.status === 'active' ? (
                                                    <button onClick={() => openConfirmModal('ban', user._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Khóa"><FaBan /></button>
                                                ) : (
                                                    <button onClick={() => openConfirmModal('unban', user._id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Mở lại"><FaUnlock /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delivery Driver Detail Modal */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold text-gray-800">Hồ sơ người dùng</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><FaTimes /></button>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left: Info */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden border-2 border-orange-100">
                                        <img src={selectedUser.avatar || "https://via.placeholder.com/150"} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">{selectedUser.fullName}</h2>
                                        <p className="text-gray-500 text-sm">{selectedUser.email}</p>
                                        <div className="mt-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUserStatusColor(selectedUser.status)}`}>
                                                {translateUserStatus(selectedUser.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                                    <div className="flex justify-between text-sm"><span className="text-gray-500">Số điện thoại:</span> <span className="font-medium">{selectedUser.mobile}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-gray-500">Giới tính:</span> <span className="font-medium">{selectedUser.gender === 1 ? 'Nam' : 'Nữ'}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-gray-500">Ngày sinh:</span> <span className="font-medium">{selectedUser.birthDay ? new Date(selectedUser.birthDay).toLocaleDateString('vi-VN') : 'N/A'}</span></div>
                                </div>

                                <div className="bg-orange-50 rounded-xl p-4 space-y-3 border border-orange-100">
                                    <h4 className="font-bold text-orange-800 text-sm uppercase">Thông tin xe</h4>
                                    <div className="flex justify-between text-sm"><span className="text-gray-600">Loại xe:</span> <span className="font-bold text-gray-900">{selectedUser.typeOfVehicle === 'motorcycle' ? 'Xe máy' : selectedUser.typeOfVehicle}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-gray-600">Biển số:</span> <span className="font-bold text-gray-900 uppercase font-mono bg-white px-2 py-0.5 rounded">{selectedUser.licensePlate}</span></div>
                                </div>
                            </div>

                            {/* Right: Docs */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase">Căn cước công dân</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="aspect-[3/2] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden relative group">
                                            {selectedUser.citizenIdentityFront ? (
                                                <a href={selectedUser.citizenIdentityFront} target="_blank" rel="noreferrer"><img src={selectedUser.citizenIdentityFront} className="w-full h-full object-contain" /></a>
                                            ) : <div className="flex items-center justify-center h-full text-xs text-gray-400">Mặt trước trống</div>}
                                        </div>
                                        <div className="aspect-[3/2] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden relative group">
                                            {selectedUser.citizenIdentityBack ? (
                                                <a href={selectedUser.citizenIdentityBack} target="_blank" rel="noreferrer"><img src={selectedUser.citizenIdentityBack} className="w-full h-full object-contain" /></a>
                                            ) : <div className="flex items-center justify-center h-full text-xs text-gray-400">Mặt sau trống</div>}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase">Giấy phép lái xe</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="aspect-[3/2] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden relative group">
                                            {selectedUser.driverLicenseFront ? (
                                                <a href={selectedUser.driverLicenseFront} target="_blank" rel="noreferrer"><img src={selectedUser.driverLicenseFront} className="w-full h-full object-contain" /></a>
                                            ) : <div className="flex items-center justify-center h-full text-xs text-gray-400">Mặt trước trống</div>}
                                        </div>
                                        <div className="aspect-[3/2] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden relative group">
                                            {selectedUser.driverLicenseBack ? (
                                                <a href={selectedUser.driverLicenseBack} target="_blank" rel="noreferrer"><img src={selectedUser.driverLicenseBack} className="w-full h-full object-contain" /></a>
                                            ) : <div className="flex items-center justify-center h-full text-xs text-gray-400">Mặt sau trống</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg font-bold hover:bg-gray-100">Đóng</button>
                            {selectedUser.status === 'pending' && (
                                <>
                                    <button onClick={() => openConfirmModal('reject', selectedUser._id)} className="px-5 py-2 text-white bg-red-500 rounded-lg font-bold hover:bg-red-600 shadow-lg shadow-red-200">Từ chối</button>
                                    <button onClick={() => openConfirmModal('approve', selectedUser._id)} className="px-5 py-2 text-white bg-green-600 rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-200">Duyệt ngay</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )
            }

            {/* Confirmation Modal */}
            {
                isConfirmOpen && (
                    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in-up">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                                <FaExclamationTriangle className="w-6 h-6 text-[#ff4d2d]" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận hành động</h3>
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc chắn muốn thực hiện hành động này không?
                            </p>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Hủy</button>
                                <button
                                    onClick={handleAction}
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 shadow-lg transition-all"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminUsers;
