import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaUtensils } from "react-icons/fa";
import { useState } from "react";
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
    const { currentCity, currentState, currentAddress } = useSelector(state => state.user);
    const [name, setName] = useState(myShopData?.name || "");
    const [address, setAddress] = useState(myShopData?.address || currentAddress);
    const [city, setCity] = useState(myShopData?.city || currentCity);
    const [state, setState] = useState(myShopData?.state || currentState);
    const [hotline, setHotline] = useState(myShopData?.hotline || "");
    const [openTime, setOpenTime] = useState(myShopData?.openTime || "08:00");
    const [closeTime, setCloseTime] = useState(myShopData?.closeTime || "22:00");
    const [frontendImage, setFrontendImage] = useState(myShopData?.image || null);
    const [backendImage, setBackendImage] = useState(null);
    const [lat, setLat] = useState(myShopData?.lat || 0);
    const [lon, setLon] = useState(myShopData?.lon || 0);
    const apiKey = import.meta.env.VITE_GEOAPIKEY;
    const dispatch = useDispatch();

    const handleImage = (e) => {
        const file = e.target.files[0];
        setBackendImage(file);
        setFrontendImage(URL.createObjectURL(file));
    }

    const handleGeocode = async () => {
        if (!address || !city) return toast.error("Vui lòng nhập thành phố và địa chỉ");
        const query = `${address}, ${state}, ${city}`;
        try {
            const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&format=json&apiKey=${apiKey}`);
            if (result.data.results && result.data.results.length > 0) {
                const { lat, lon } = result.data.results[0];
                setLat(lat);
                setLon(lon);
                toast.success("Đã tìm thấy vị trí trên bản đồ!");
            } else {
                toast.error("Không tìm thấy vị trí.");
            }
        } catch (error) {
            console.log("Geocode error", error);
        }
    };
    const getAddressByLatLng = async (lat, lng) => {
        try {
            const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`);
            if (result.data.results && result.data.results.length > 0) {
                const data = result.data.results[0];
                setAddress(data.address_line1 || "");
                setCity(data.city || "");
                setState(data.state || "");
            }
        } catch (error) {
            console.log(error);
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("address", address);
            formData.append("city", city);
            formData.append("state", state);
            formData.append("hotline", hotline);
            formData.append("openTime", openTime);
            formData.append("closeTime", closeTime);
            formData.append("lat", lat);
            formData.append("lon", lon);
            if (backendImage) {
                formData.append("image", backendImage);
            }
            const result = await axios.post(`${serverUrl}/api/shop/create-edit`, formData, { withCredentials: true });
            toast.success("Shop details saved successfully", { duration: 2000 });

            // Re-fetch complete shop data including items to ensure UI consistency
            const shopData = await axios.get(`${serverUrl}/api/shop/get-my`, { withCredentials: true });
            dispatch(setMyShopData(shopData.data));

            navigate("/");
            console.log(shopData.data);
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className='flex justify-center flex-col items-center p-6  bg-gradient-to-br from-orange-50 relative to-white min-h-screen'>
            <div className='absolute top-[20px] left-[20px] z-[10] mb-[10px]' onClick={() => navigate("/")}>
                <IoArrowBack size={36} className='text-[#ff4d2d]' />
            </div>
            <div className='max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100'>
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-orange-100 p-4 mb-4 rounded-full">
                        <FaUtensils className="text-[#ff4d2d] w-16 h-16" />
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900">
                        {myShopData ? "Cập nhật thông tin nhà hàng" : "Thêm thông tin nhà hàng"}
                    </div>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div >
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên shop</label>
                        <input type="text" placeholder="Nhập tên shop" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50
                        focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                            onChange={(e) => setName(e.target.value)} value={name} />
                    </div>
                    <div >
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Hình ảnh shop</label>
                        <input type="file" accept="image/*" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50
                        focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-[#ff4d2d] hover:file:bg-orange-100" onChange={handleImage} />
                        {frontendImage &&
                            <div className="mt-4">
                                <img src={frontendImage} alt="" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                            </div>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div >
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Thành phố</label>
                            <input type="text" placeholder="Nhập thành phố" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50
                            focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                                onChange={(e) => setCity(e.target.value)} value={city} />
                        </div>
                        <div >
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tỉnh/Thành phố</label>
                            <input type="text" placeholder="Nhập tỉnh/thành phố" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50
                            focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                                onChange={(e) => setState(e.target.value)} value={state} />
                        </div>
                    </div>
                    <div >
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ</label>
                        <div className="flex gap-2">
                            <input type="text" placeholder="Nhập địa chỉ" className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50
                        focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                                onChange={(e) => setAddress(e.target.value)} value={address} />
                            <button type="button" onClick={handleGeocode} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 rounded-xl flex items-center justify-center transition" title="Tìm vị trí trên bản đồ">
                                <IoSearchOutline size={20} />
                            </button>
                        </div>

                        {(lat !== 0 || lon !== 0) && (
                            <div className="mt-3 h-56 w-full rounded-xl overflow-hidden border border-gray-200">
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
                                                getAddressByLatLng(lat, lng);
                                            },
                                        }}
                                    ></Marker>
                                </MapContainer>
                            </div>
                        )}
                    </div>
                    <div >
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Hotline (tùy chọn)</label>
                        <input type="tel" placeholder="Nhập số điện thoại" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50
                        focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                            onChange={(e) => setHotline(e.target.value)} value={hotline} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div >
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Giờ mở cửa</label>
                            <input type="time" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50
                            focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                                onChange={(e) => setOpenTime(e.target.value)} value={openTime} />
                        </div>
                        <div >
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Giờ đóng cửa</label>
                            <input type="time" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50
                            focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                                onChange={(e) => setCloseTime(e.target.value)} value={closeTime} />
                        </div>
                    </div>
                    <button className="w-full bg-[#ff4d2d] text-white py-3 px-6 rounded-xl hover:bg-[#e64323] font-bold
                    shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all duration-200 cursor-pointer active:scale-[0.98]">
                        Cập nhật
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreateEditShop
