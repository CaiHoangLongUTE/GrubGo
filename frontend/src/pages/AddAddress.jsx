import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { IoArrowBack, IoSearchOutline } from "react-icons/io5";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import { serverUrl } from '../App';

function RecenterMap({ location }) {
    if (location.lat && location.lon) {
        const map = useMap();
        map.setView([location.lat, location.lon], 16, { animate: true });
    }
    return null;
}

const AddAddress = () => {
    const navigate = useNavigate();
    const [newAddress, setNewAddress] = useState({
        tag: "Nhà riêng",
        city: "", // Tỉnh/Thành phố
        district: "", // Quận/Huyện
        commune: "", // Phường/Xã
        address: "", // Số nhà/Tên đường
        lat: 0,
        lon: 0,
        isDefault: false
    });

    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [communes, setCommunes] = useState([]);

    const [selectedCityCode, setSelectedCityCode] = useState(null);
    const [selectedDistCode, setSelectedDistCode] = useState(null);



    useEffect(() => {
        // Fetch Cities (Provinces) on Mount
        const fetchCities = async () => {
            try {
                const res = await axios.get("https://provinces.open-api.vn/api/?depth=1");
                setCities(res.data);
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
        };
        fetchCities();
    }, []);

    const handleCityChange = async (e) => {
        const cityCode = e.target.value;
        const cityName = e.target.options[e.target.selectedIndex].text;

        setSelectedCityCode(cityCode);
        setNewAddress(prev => ({ ...prev, city: cityName, district: "", commune: "" }));
        setDistricts([]);
        setCommunes([]);

        if (cityCode) {
            try {
                // Depth 2 gives districts
                const res = await axios.get(`https://provinces.open-api.vn/api/p/${cityCode}?depth=2`);
                setDistricts(res.data.districts);
            } catch (error) {
                console.error("Error fetching districts:", error);
            }
        }
    };

    const handleDistrictChange = async (e) => {
        const distCode = e.target.value;
        const distName = e.target.options[e.target.selectedIndex].text;

        setSelectedDistCode(distCode);
        setNewAddress(prev => ({ ...prev, district: distName, commune: "" }));
        setCommunes([]);

        if (distCode) {
            try {
                // Depth 2 gives wards (communes)
                const res = await axios.get(`https://provinces.open-api.vn/api/d/${distCode}?depth=2`);
                setCommunes(res.data.wards);
            } catch (error) {
                console.error("Error fetching communes:", error);
            }
        }
    };

    const handleCommuneChange = (e) => {
        const communeName = e.target.options[e.target.selectedIndex].text;
        setNewAddress(prev => ({ ...prev, commune: communeName }));
    };

    // Helper: Get Coordinates
    const getCoordinates = async (addr, commune, district, city) => {
        const fullQuery = `${addr}, ${commune}, ${district}, ${city}`;
        const fallbackQuery = `${addr}, ${city}`;

        try {
            // Priority 1: Full Query
            let res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullQuery)}&format=json&addressdetails=1&limit=5&countrycodes=vn`);

            if (res.data && res.data.length > 0) {
                const bestMatch = res.data.find(item => {
                    const addrDetails = item.address || {};
                    const itemCity = (addrDetails.city || addrDetails.state || addrDetails.province || "").toLowerCase();
                    const selectedCity = city.toLowerCase().replace("thành phố ", "").replace("tỉnh ", "");
                    return itemCity.includes(selectedCity);
                }) || res.data[0];
                return { lat: parseFloat(bestMatch.lat), lon: parseFloat(bestMatch.lon) };
            }

            // Priority 2: Fallback Query (Address + City)
            res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fallbackQuery)}&format=json&addressdetails=1&limit=5&countrycodes=vn`);
            if (res.data && res.data.length > 0) {
                return { lat: parseFloat(res.data[0].lat), lon: parseFloat(res.data[0].lon) };
            }

        } catch (error) {
            console.log("Geocode API error", error);
        }
        return null;
    };

    // Auto-fill lat/lon from address string (Simple Geocoding)
    const handleGeocode = async () => {
        if (!newAddress.address || !newAddress.city) return;
        const coords = await getCoordinates(newAddress.address, newAddress.commune, newAddress.district, newAddress.city);
        if (coords) {
            const { lat, lon } = coords;
            setNewAddress(prev => ({ ...prev, lat, lon }));
            toast.success("Đã tìm thấy vị trí trên bản đồ!");
        } else {
            toast.error("Không tìm thấy vị trí. Vui lòng kiểm tra lại địa chỉ.");
        }
    };

    const handleSaveAddress = async () => {
        if (!newAddress.address || !newAddress.city || !newAddress.district || !newAddress.commune) {
            return toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");
        }

        // Prepare Payload to avoid stale state issues
        let payload = { ...newAddress };

        // Ensure lat/lon are set if missing using the helper
        if (payload.lat === 0 && payload.lon === 0) {
            const coords = await getCoordinates(payload.address, payload.commune, payload.district, payload.city);
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
            await axios.post(`${serverUrl}/api/address/add`, payload, { withCredentials: true });
            toast.success("Thêm địa chỉ mới thành công");
            navigate(-1);
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Lỗi khi lưu địa chỉ. Vui lòng thử lại.";
            toast.error(msg);
        }
    };

    return (
        <div className='min-h-screen bg-[#fff9f6] p-4 font-sans'>
            <div className='max-w-3xl mx-auto'>
                {/* Header */}
                <div className='flex items-center gap-4 mb-6 cursor-pointer group w-fit' onClick={() => navigate(-1)}>
                    <div className="p-2 bg-white rounded-full shadow-sm text-[#ff4d2d] group-hover:bg-[#ff4d2d] group-hover:text-white transition-all">
                        <IoArrowBack size={24} />
                    </div>
                    <h1 className='text-2xl font-bold text-gray-800'>Thêm địa chỉ mới</h1>
                </div>

                {/* Form */}
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại địa chỉ</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {["Nhà riêng", "Văn phòng"].map(t => (
                                    <button key={t}
                                        onClick={() => setNewAddress(prev => ({ ...prev, tag: t }))}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${newAddress.tag === t ? 'bg-[#ff4d2d] text-white border-[#ff4d2d] shadow-md shadow-orange-200' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-200'}`}>
                                        {t}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setNewAddress(prev => ({ ...prev, tag: "" }))}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${!["Nhà riêng", "Văn phòng"].includes(newAddress.tag) ? 'bg-[#ff4d2d] text-white border-[#ff4d2d] shadow-md shadow-orange-200' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-200'}`}>
                                    Khác
                                </button>
                            </div>
                            {!["Nhà riêng", "Văn phòng"].includes(newAddress.tag) && (
                                <input
                                    type="text"
                                    value={newAddress.tag}
                                    onChange={(e) => setNewAddress(prev => ({ ...prev, tag: e.target.value }))}
                                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-100 focus:border-[#ff4d2d] focus:bg-white outline-none text-sm transition-all"
                                    placeholder="Nhập tên gợi nhớ (VD: Nhà bà ngoại, Công ty...)"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                                <select
                                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-100 focus:border-[#ff4d2d] focus:bg-white outline-none transition-all appearance-none"
                                    onChange={handleCityChange}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Chọn Tỉnh/Thành</option>
                                    {cities.map(city => (
                                        <option key={city.code} value={city.code}>{city.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                                <select
                                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-100 focus:border-[#ff4d2d] focus:bg-white outline-none transition-all appearance-none"
                                    onChange={handleDistrictChange}
                                    disabled={!selectedCityCode}
                                    value={selectedDistCode || ""}
                                >
                                    <option value="" disabled>Chọn Quận/Huyện</option>
                                    {districts.map(dist => (
                                        <option key={dist.code} value={dist.code}>{dist.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Xã/Phường</label>
                                <select
                                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-100 focus:border-[#ff4d2d] focus:bg-white outline-none transition-all appearance-none"
                                    onChange={handleCommuneChange}
                                    disabled={!selectedDistCode}
                                    defaultValue=""
                                >
                                    <option value="" disabled>Chọn Xã/Phường</option>
                                    {communes.map(commune => (
                                        <option key={commune.code} value={commune.code}>{commune.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newAddress.address}
                                    onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                                    className="flex-1 border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-100 focus:border-[#ff4d2d] focus:bg-white outline-none transition-all"
                                    placeholder="Số nhà, tên đường..."
                                />
                                <button onClick={handleGeocode} className="bg-orange-50 hover:bg-[#ff4d2d] hover:text-white text-[#ff4d2d] px-4 rounded-xl flex items-center font-medium transition-all border border-orange-200 hover:border-[#ff4d2d]" title="Lấy vị trí">
                                    <IoSearchOutline />
                                </button>
                            </div>
                        </div>

                        {/* Map Visualization */}
                        {(newAddress.lat !== 0 || newAddress.lon !== 0) && (
                            <div className='rounded-2xl border-2 border-gray-200 overflow-hidden h-56 mt-2 shadow-sm'>
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

                        <div className="flex gap-3 pt-6">
                            <button onClick={handleSaveAddress} className="flex-1 bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4a] text-white py-3.5 rounded-2xl font-bold hover:from-[#e64323] hover:to-[#ff5a39] transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300 active:scale-[0.98]">
                                ✓ Hoàn tất
                            </button>
                            <button onClick={() => navigate(-1)} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]">
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddAddress;
