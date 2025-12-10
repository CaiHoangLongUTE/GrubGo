import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { IoArrowBack, IoAdd, IoLocationSharp, IoTrash, IoPencil, IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { serverUrl } from '../App';
import { setAddress, setLocation } from '../redux/mapSlice';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";

function RecenterMap({ location }) {
    if (location.lat && location.lon) {
        const map = useMap();
        map.setView([location.lat, location.lon], 16, { animate: true });
    }
    return null;
}

const MyAddresses = () => {
    const { userData } = useSelector(state => state.user);
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isSelectionMode = searchParams.get('select') === 'true';

    // Form State
    const [newAddress, setNewAddress] = useState({
        tag: "Nhà riêng",
        city: "",
        state: "",
        address: "",
        lat: 0,
        lon: 0,
        isDefault: false
    });

    const apiKey = import.meta.env.VITE_GEOAPIKEY;

    useEffect(() => {
        if (userData) fetchAddresses();
    }, [userData]);

    const fetchAddresses = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/address/get-all`, { withCredentials: true });
            setAddresses(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    // Helper: Get Coordinates
    const getCoordinates = async (addr, state, city) => {
        const query = `${addr}, ${state}, ${city}`;
        try {
            const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&format=json&apiKey=${apiKey}`);
            if (result.data.results && result.data.results.length > 0) {
                return result.data.results[0]; // { lat, lon, ... }
            }
        } catch (error) {
            console.log("Geocode API error", error);
        }
        return null;
    };

    // Auto-fill lat/lon from address string (Simple Geocoding)
    const handleGeocode = async () => {
        if (!newAddress.address || !newAddress.city) return;
        const coords = await getCoordinates(newAddress.address, newAddress.state, newAddress.city);
        if (coords) {
            const { lat, lon } = coords;
            setNewAddress(prev => ({ ...prev, lat, lon }));
            toast.success("Đã tìm thấy vị trí trên bản đồ!");
        } else {
            toast.error("Không tìm thấy vị trí. Vui lòng kiểm tra lại địa chỉ.");
        }
    };

    const handleSaveAddress = async () => {
        if (!newAddress.address || !newAddress.city || !newAddress.state) {
            return toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");
        }

        // Prepare Payload to avoid stale state issues
        let payload = { ...newAddress };

        // Ensure lat/lon are set if missing using the helper
        if (payload.lat === 0 && payload.lon === 0) {
            const coords = await getCoordinates(payload.address, payload.state, payload.city);
            if (coords) {
                payload.lat = coords.lat;
                payload.lon = coords.lon;
                // Update UI state as well
                setNewAddress(prev => ({ ...prev, lat: coords.lat, lon: coords.lon }));
            } else {
                return toast.error("Không thể xác định vị trí bản đồ. Vui lòng kiểm tra lại địa chỉ.");
            }
        }

        try {
            if (isEditing) {
                await axios.put(`${serverUrl}/api/address/update/${editId}`, payload, { withCredentials: true });
                toast.success("Cập nhật địa chỉ thành công");
            } else {
                await axios.post(`${serverUrl}/api/address/add`, payload, { withCredentials: true });
                toast.success("Thêm địa chỉ mới thành công");
            }
            fetchAddresses();
            resetForm();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Lỗi khi lưu địa chỉ. Vui lòng thử lại.";
            toast.error(msg);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
        try {
            await axios.delete(`${serverUrl}/api/address/delete/${id}`, { withCredentials: true });
            toast.success("Đã xóa địa chỉ");
            fetchAddresses();
        } catch (error) {
            toast.error("Lỗi khi xóa");
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await axios.put(`${serverUrl}/api/address/set-default/${id}`, {}, { withCredentials: true });
            toast.success("Đã đặt làm mặc định");
            fetchAddresses();
        } catch (error) {
            toast.error("Lỗi cập nhật");
        }
    };

    const handleEdit = (addr) => {
        setNewAddress({
            tag: addr.tag,
            city: addr.city,
            state: addr.state,
            address: addr.address,
            lat: addr.lat,
            lon: addr.lon,
            isDefault: addr.isDefault
        });
        setEditId(addr._id);
        setIsEditing(true);
        setShowForm(true);
    };

    const resetForm = () => {
        setNewAddress({ tag: "Nhà riêng", city: "", state: "", address: "", lat: 0, lon: 0, isDefault: false });
        setIsEditing(false);
        setEditId(null);
        setShowForm(false);
    };

    const handleSelect = (addr) => {
        if (!isSelectionMode) return;
        // Dispatch to global state
        const dispatch = useDispatch(); // This specific line needs to be inside component, but react hooks rule. 
        // Wait, I cannot call hooks inside this function. I must define dispatch outside.
        // It's defined below.
    };

    // Correct Hook Usage
    const dispatch = useDispatch();
    const onSelectAddress = (addr) => {
        if (isSelectionMode) {
            dispatch(setAddress(addr.address));
            dispatch(setLocation({ lat: addr.lat, lon: addr.lon }));
            navigate(-1); // Go back to Checkout
        }
    };

    return (
        <div className='min-h-screen bg-[#fff9f6] p-4 font-sans'>
            <div className='max-w-3xl mx-auto'>
                {/* Header */}
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-2'>
                        <button onClick={() => navigate(-1)} className='p-2 hover:bg-gray-100 rounded-full transition text-gray-700'>
                            <IoArrowBack size={24} />
                        </button>
                        <h1 className='text-xl font-bold text-gray-800'>Địa chỉ của tôi</h1>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className='flex items-center gap-1 text-[#ff4d2d] font-semibold hover:bg-orange-50 px-3 py-1.5 rounded-lg transition'>
                        <IoAdd size={20} /> <span className="hidden sm:inline">Thêm địa chỉ</span>
                    </button>
                </div>

                {/* Content */}
                {showForm ? (
                    <div className="bg-white p-6 rounded-2xl shadow-xl animate-fade-in-up">
                        <h2 className="text-lg font-bold mb-4">{isEditing ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loại địa chỉ</label>
                                <div className="flex gap-2 mb-2">
                                    {["Nhà riêng", "Văn phòng"].map(t => (
                                        <button key={t}
                                            onClick={() => setNewAddress(prev => ({ ...prev, tag: t }))}
                                            className={`px-3 py-1.5 rounded-lg text-sm border ${newAddress.tag === t ? 'bg-[#ff4d2d] text-white border-[#ff4d2d]' : 'bg-white text-gray-600 border-gray-200'}`}>
                                            {t}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setNewAddress(prev => ({ ...prev, tag: "" }))}
                                        className={`px-3 py-1.5 rounded-lg text-sm border ${!["Nhà riêng", "Văn phòng"].includes(newAddress.tag) ? 'bg-[#ff4d2d] text-white border-[#ff4d2d]' : 'bg-white text-gray-600 border-gray-200'}`}>
                                        Khác
                                    </button>
                                </div>
                                {!["Nhà riêng", "Văn phòng"].includes(newAddress.tag) && (
                                    <input
                                        type="text"
                                        value={newAddress.tag}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, tag: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#ff4d2d] focus:border-[#ff4d2d] outline-none text-sm"
                                        placeholder="Nhập tên gợi nhớ (VD: Nhà bà ngoại, Công ty...)"
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                                    <input
                                        type="text"
                                        value={newAddress.state}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#ff4d2d] focus:border-[#ff4d2d] outline-none"
                                        placeholder="Ví dụ: Đà Nẵng"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                                    <input
                                        type="text"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#ff4d2d] focus:border-[#ff4d2d] outline-none"
                                        placeholder="Ví dụ: Xã Bà Nà"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newAddress.address}
                                        onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                                        className="flex-1 border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#ff4d2d] focus:border-[#ff4d2d] outline-none"
                                        placeholder="Số nhà, tên đường..."
                                    />
                                    <button onClick={handleGeocode} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 rounded-lg flex items-center" title="Lấy vị trí">
                                        <IoSearchOutline />
                                    </button>
                                </div>
                            </div>

                            {/* Map Visualization */}
                            {(newAddress.lat !== 0 || newAddress.lon !== 0) && (
                                <div className='rounded-xl border overflow-hidden h-48 mt-2'>
                                    <MapContainer className='w-full h-full' center={[newAddress.lat, newAddress.lon]} zoom={15} scrollWheelZoom={true}>
                                        <TileLayer attribution='&copy; Contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <RecenterMap location={{ lat: newAddress.lat, lon: newAddress.lon }} />
                                        <Marker
                                            position={[newAddress.lat, newAddress.lon]}
                                            draggable={true}
                                            eventHandlers={{
                                                dragend: (e) => {
                                                    const { lat, lng } = e.target.getLatLng();
                                                    setNewAddress(prev => ({ ...prev, lat, lon: lng }));
                                                },
                                            }}
                                        ></Marker>
                                    </MapContainer>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="defaultAddr"
                                    checked={newAddress.isDefault}
                                    onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                                    className="w-4 h-4 text-[#ff4d2d] focus:ring-[#ff4d2d] border-gray-300 rounded"
                                />
                                <label htmlFor="defaultAddr" className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={handleSaveAddress} className="flex-1 bg-[#ff4d2d] text-white py-2.5 rounded-xl font-bold hover:bg-[#e64323] transition shadow-lg shadow-orange-200">
                                    {isEditing ? "Lưu thay đổi" : "Hoàn tất"}
                                </button>
                                <button onClick={resetForm} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition">
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.length === 0 && (
                            <div className="text-center py-10 bg-white rounded-2xl shadow-sm">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <IoLocationSharp size={30} />
                                </div>
                                <p className="text-gray-500 mb-4">Bạn chưa lưu địa chỉ nào.</p>
                                <button onClick={() => setShowForm(true)} className="text-[#ff4d2d] font-bold hover:underline">Thêm ngay</button>
                            </div>
                        )}

                        {addresses.map((addr) => (
                            <div key={addr._id}
                                onClick={() => onSelectAddress(addr)}
                                className={`bg-white p-5 rounded-2xl shadow-sm border transition-all relative group
                                ${isSelectionMode ? 'cursor-pointer hover:border-[#ff4d2d]' : 'border-gray-100'}
                                `}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-800">{userData?.fullName}</span>
                                            <span className="text-gray-400">|</span>
                                            <span className="text-gray-600">{userData?.mobile}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-1">{addr.address}</p>
                                        <p className="text-gray-500 text-xs mb-2">{addr.city}, {addr.state}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="border border-[#ff4d2d] text-[#ff4d2d] text-[10px] px-1.5 py-0.5 rounded font-medium">{addr.tag}</span>
                                            {addr.isDefault && <span className="bg-[#ff4d2d] text-white text-[10px] px-1.5 py-0.5 rounded font-medium">Mặc định</span>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 pl-4 border-l border-gray-100 ml-2">
                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(addr); }} className="text-blue-500 hover:bg-blue-50 rounded p-1.5 transition" title="Sửa">
                                            <IoPencil size={18} />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(addr._id); }} className="text-red-500 hover:bg-red-50 rounded p-1.5 transition" title="Xóa">
                                            <IoTrash size={18} />
                                        </button>
                                    </div>
                                </div>

                                {!addr.isDefault && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleSetDefault(addr._id); }}
                                        className="mt-3 text-sm text-gray-500 hover:text-[#ff4d2d] transition disabled:opacity-50 font-medium">
                                        Thiết lập mặc định
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAddresses;
