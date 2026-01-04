import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaUtensils } from "react-icons/fa";
import { useState, useEffect } from "react";
import { serverUrl } from "../App";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";
import toast from "react-hot-toast";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import { IoSearchOutline } from "react-icons/io5";

function RecenterMap({ location }) {
    if (location.lat && location.lon) {
        const map = useMap();
        map.setView([location.lat, location.lon], 16, { animate: true });
    }
    return null;
}

function CreateEditShop() {
    const navigate = useNavigate();
    const { myShopData } = useSelector(state => state.owner);
    const { currentCity, currentDistrict, currentCommune, currentAddress } = useSelector(state => state.user);
    const [name, setName] = useState(myShopData?.name || "");
    const [address, setAddress] = useState(myShopData?.address || currentAddress);
    const [city, setCity] = useState(myShopData?.city || currentCity);
    const [district, setDistrict] = useState(myShopData?.district || currentDistrict);
    const [commune, setCommune] = useState(myShopData?.commune || currentCommune);
    const [hotline, setHotline] = useState(myShopData?.hotline || "");
    const [openTime, setOpenTime] = useState(myShopData?.openTime || "08:00");
    const [closeTime, setCloseTime] = useState(myShopData?.closeTime || "22:00");
    const [frontendImage, setFrontendImage] = useState(myShopData?.image || null);
    const [backendImage, setBackendImage] = useState(null);
    const [lat, setLat] = useState(myShopData?.lat || 0);
    const [lon, setLon] = useState(myShopData?.lon || 0);

    // License States
    const [businessLicense, setBusinessLicense] = useState(null); // File
    const [foodSafetyLicense, setFoodSafetyLicense] = useState(null); // File
    const [firePreventionLicense, setFirePreventionLicense] = useState(null); // File

    const [businessLicenseUrl, setBusinessLicenseUrl] = useState(myShopData?.businessLicense || null);
    const [foodSafetyLicenseUrl, setFoodSafetyLicenseUrl] = useState(myShopData?.foodSafetyLicense || null);
    const [firePreventionLicenseUrl, setFirePreventionLicenseUrl] = useState(myShopData?.firePreventionLicense || null);

    const dispatch = useDispatch();

    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [communes, setCommunes] = useState([]);

    useEffect(() => {
        // Fetch Cities
        const fetchCities = async () => {
            try {
                const res = await axios.get("https://provinces.open-api.vn/api/?depth=1");
                setCities(res.data);

                // If city exists, try to find code to load districts
                if (city) {
                    const foundCity = res.data.find(c => c.name === city);
                    if (foundCity) {
                        fetchDistricts(foundCity.code);
                    }
                }
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
        };
        fetchCities();
    }, []);

    const fetchDistricts = async (cityCode) => {
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/p/${cityCode}?depth=2`);
            setDistricts(res.data.districts);

            // If district exists, try to find code to load communes
            if (district) {
                const foundDist = res.data.districts.find(d => d.name === district);
                if (foundDist) fetchCommunes(foundDist.code);
            }
        } catch (error) {
            console.error("Error fetching districts:", error);
        }
    }

    const fetchCommunes = async (distCode) => {
        try {
            const res = await axios.get(`https://provinces.open-api.vn/api/d/${distCode}?depth=2`);
            setCommunes(res.data.wards);
        } catch (error) {
            console.error("Error fetching communes:", error);
        }
    }

    const handleCityChange = (e) => {
        const cityCode = e.target.value;
        const cityName = e.target.options[e.target.selectedIndex].text;
        setCity(cityName);
        setDistrict("");
        setCommune("");
        setDistricts([]);
        setCommunes([]);
        if (cityCode) fetchDistricts(cityCode);
    }

    const handleDistrictChange = (e) => {
        const distCode = e.target.value;
        const distName = e.target.options[e.target.selectedIndex].text;
        setDistrict(distName);
        setCommune("");
        setCommunes([]);
        if (distCode) fetchCommunes(distCode);
    }

    const handleCommuneChange = (e) => {
        const communeName = e.target.options[e.target.selectedIndex].text;
        setCommune(communeName);
    }

    const handleImage = (e) => {
        const file = e.target.files[0];
        setBackendImage(file);
        setFrontendImage(URL.createObjectURL(file));
    }

    const getLatLngByAddress = async () => {
        if (!address || !city) return toast.error("Vui lòng nhập thành phố và địa chỉ");

        let query = `${address}, ${commune}, ${district}, ${city}`;

        try {
            // Using Nominatim (OpenStreetMap) API
            const result = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=vn`);

            if (result.data && result.data.length > 0) {
                // Nominatim returns lat/lon as strings
                const bestMatch = result.data.find(item => {
                    const addr = item.address || {};
                    const itemCity = (addr.city || addr.state || addr.province || "").toLowerCase();
                    const selectedCity = city.toLowerCase().replace("thành phố ", "").replace("tỉnh ", "");
                    return itemCity.includes(selectedCity);
                }) || result.data[0];

                setLat(parseFloat(bestMatch.lat));
                setLon(parseFloat(bestMatch.lon));
                toast.success("Đã tìm thấy vị trí trên bản đồ (OSM)!");
            } else {
                // Fallback: Try searching only Address + City (ignoring Ward/District which might mismatch)
                const fallbackQuery = `${address}, ${city}`;
                const fallbackResult = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fallbackQuery)}&format=json&addressdetails=1&limit=5&countrycodes=vn`);

                if (fallbackResult.data && fallbackResult.data.length > 0) {
                    const bestMatch = fallbackResult.data[0];
                    setLat(parseFloat(bestMatch.lat));
                    setLon(parseFloat(bestMatch.lon));
                    toast.success("Đã tìm thấy vị trí (tìm tương đối)!");
                } else {
                    toast.error("Không tìm thấy vị trí trên OpenStreetMap.");
                }
            }
        } catch (error) {
            console.log("Geocode error", error);
            toast.error("Lỗi khi tìm kiếm vị trí.");
        }
    };
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!name || !city || !district || !commune || !address) {
            return toast.error("Vui lòng điền đầy đủ thông tin chung và địa chỉ");
        }

        // For new shops, licenses and main image are required
        if (!myShopData) {
            if (!backendImage) return toast.error("Vui lòng chọn ảnh đại diện cho quán");
            if (!businessLicense) return toast.error("Vui lòng tải lên Giấy phép kinh doanh");
            if (!foodSafetyLicense) return toast.error("Vui lòng tải lên Giấy chứng nhận ATTP");
            if (!firePreventionLicense) return toast.error("Vui lòng tải lên Giấy PCCC");
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("address", address);
            formData.append("city", city);
            formData.append("district", district);
            formData.append("commune", commune);
            formData.append("hotline", hotline);
            formData.append("openTime", openTime);
            formData.append("closeTime", closeTime);
            formData.append("lat", lat);
            formData.append("lon", lon);
            if (backendImage) {
                formData.append("image", backendImage);
            }
            if (businessLicense) formData.append("businessLicense", businessLicense);
            if (foodSafetyLicense) formData.append("foodSafetyLicense", foodSafetyLicense);
            if (firePreventionLicense) formData.append("firePreventionLicense", firePreventionLicense);

            const result = await axios.post(`${serverUrl}/api/shop/create-edit`, formData, { withCredentials: true });

            toast.success("Thông tin shop đã được lưu thành công!", { duration: 2000 });
            const shopData = await axios.get(`${serverUrl}/api/shop/get-my`, { withCredentials: true });
            dispatch(setMyShopData(shopData.data));
            navigate("/");

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu thông tin shop");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className='min-h-screen bg-gray-50 p-6'>
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='flex items-center gap-4 mb-8 cursor-pointer group w-fit' onClick={() => navigate("/")}>
                    <div className="p-2 bg-white rounded-full shadow-sm text-[#ff4d2d] group-hover:bg-[#ff4d2d] group-hover:text-white transition-all">
                        <IoArrowBack size={24} />
                    </div>
                    <h1 className='text-2xl font-bold text-gray-800'>
                        {myShopData ? "Cập nhật thông tin nhà hàng" : "Thêm thông tin nhà hàng"}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: General Info */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FaUtensils className="text-[#ff4d2d]" />
                                Thông tin chung
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên shop</label>
                                    <input type="text" placeholder="Nhập tên shop" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                                        onChange={(e) => setName(e.target.value)} value={name} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Hotline</label>
                                    <input type="tel" placeholder="Nhập số điện thoại" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                                        onChange={(e) => setHotline(e.target.value)} value={hotline} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mở cửa</label>
                                        <input type="time" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                                            onChange={(e) => setOpenTime(e.target.value)} value={openTime} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Đóng cửa</label>
                                        <input type="time" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                                            onChange={(e) => setCloseTime(e.target.value)} value={closeTime} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Hình ảnh </label>
                                    <input type="file" accept="image/*" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-[#ff4d2d] hover:file:bg-orange-100" onChange={handleImage} />
                                    {frontendImage &&
                                        <div className="mt-4">
                                            <img src={frontendImage} alt="" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                                        </div>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Giấy tờ pháp lý</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Giấy phép kinh doanh</label>
                                    <input
                                        type="file"
                                        accept="application/pdf, image/*"
                                        onChange={(e) => setBusinessLicense(e.target.files[0])}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                    {businessLicenseUrl && !businessLicense && (
                                        <a href={businessLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 mt-1 block">Xem giấy phép hiện tại</a>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Giấy chứng nhận ATTP</label>
                                    <input
                                        type="file"
                                        accept="application/pdf, image/*"
                                        onChange={(e) => setFoodSafetyLicense(e.target.files[0])}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                    {foodSafetyLicenseUrl && !foodSafetyLicense && (
                                        <a href={foodSafetyLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 mt-1 block">Xem giấy phép hiện tại</a>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Giấy PCCC</label>
                                    <input
                                        type="file"
                                        accept="application/pdf, image/*"
                                        onChange={(e) => setFirePreventionLicense(e.target.files[0])}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                    />
                                    {firePreventionLicenseUrl && !firePreventionLicense && (
                                        <a href={firePreventionLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 mt-1 block">Xem giấy phép hiện tại</a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Location */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <IoSearchOutline className="text-[#ff4d2d]" />
                                Địa chỉ & Vị trí
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div >
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tỉnh/Thành phố</label>
                                        <select
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm appearance-none"
                                            onChange={handleCityChange}
                                            value={cities.find(c => c.name === city)?.code || ""}
                                        >
                                            <option value="" disabled>Chọn Tỉnh/Thành</option>
                                            {cities.map(c => (
                                                <option key={c.code} value={c.code}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div >
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Quận/Huyện</label>
                                        <select
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm appearance-none"
                                            onChange={handleDistrictChange}
                                            value={districts.find(d => d.name === district)?.code || ""}
                                            disabled={!districts.length}
                                        >
                                            <option value="" disabled>Chọn Quận/Huyện</option>
                                            {districts.map(d => (
                                                <option key={d.code} value={d.code}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div >
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Xã/Phường</label>
                                        <select
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm appearance-none"
                                            onChange={handleCommuneChange}
                                            value={communes.find(c => c.name === commune)?.code || ""}
                                            disabled={!communes.length}
                                        >
                                            <option value="" disabled>Chọn Xã/Phường</option>
                                            {communes.map(c => (
                                                <option key={c.code} value={c.code}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div >
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ cụ thể</label>
                                    <div className="flex gap-2">
                                        <input type="text" placeholder="Số nhà, tên đường..." className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                                            onChange={(e) => setAddress(e.target.value)} value={address} />
                                        <button type="button" onClick={getLatLngByAddress} className="bg-[#ff4d2d]/10 hover:bg-[#ff4d2d]/20 text-[#ff4d2d] px-6 rounded-xl flex items-center justify-center transition font-medium text-sm" title="Tìm vị trí trên bản đồ">
                                            Tìm trên bản đồ
                                        </button>
                                    </div>
                                </div>

                                <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-gray-200 relative z-0">
                                    {(lat !== 0 || lon !== 0) ? (
                                        <MapContainer className='w-full h-full' center={[lat, lon]} zoom={15} scrollWheelZoom={true}>
                                            <TileLayer attribution='&copy; Contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <RecenterMap location={{ lat, lon }} />
                                            <Marker
                                                position={[lat, lon]}
                                                draggable={true}
                                                eventHandlers={{
                                                    dragend: (e) => {
                                                        const { lat, lng } = e.target.getLatLng();
                                                        setLat(lat);
                                                        setLon(lng);
                                                    },
                                                }}
                                            ></Marker>
                                        </MapContainer>
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                                            <IoSearchOutline size={48} className="mb-2" />
                                            <p>Vui lòng nhập địa chỉ và bấm "Tìm trên bản đồ"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className={`w-full bg-[#ff4d2d] text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e64323] hover:shadow-orange-300'}`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Đang xử lý...
                                </>
                            ) : (
                                myShopData ? "Lưu thay đổi" : "Đăng ký nhà hàng"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateEditShop
