import { IoArrowBack, IoAdd } from "react-icons/io5";
import { IoLocationSharp } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import "leaflet/dist/leaflet.css";
import { useNavigate } from 'react-router-dom';
import { setAddress, setLocation } from "../redux/mapSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import { MdDeliveryDining } from "react-icons/md";
import { FaMobileScreenButton } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa";
import { serverUrl } from './../App';
import { addMyOrder } from "../redux/userSlice";

function RecenterMap({ location }) {
    if (location.lat && location.lon) {
        const map = useMap();
        map.setView([location.lat, location.lon], 16, { animate: true });
    }
    return null;
}

function CheckOut() {
    const { location, address } = useSelector(state => state.map);
    const { cartItems, totalAmount, userData } = useSelector(state => state.user);
    const [addressInput, setAddressInput] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [savedAddresses, setSavedAddresses] = useState([]);
    const apiKey = import.meta.env.VITE_GEOAPIKEY;

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/address/get-all`, { withCredentials: true });
                setSavedAddresses(result.data);

                // Optional: Auto-select default address if available and no location is set
                const defaultAddr = result.data.find(addr => addr.isDefault);
                if (defaultAddr && !address) {
                    dispatch(setAddress(defaultAddr.address));
                    dispatch(setLocation({ lat: defaultAddr.lat, lon: defaultAddr.lon }));
                    setAddressInput(defaultAddr.address);
                }
            } catch (error) {
                console.log(error);
            }
        }
        if (userData) {
            fetchAddresses();
        }
    }, [userData]);

    const handleSelectAddress = (addr) => {
        setAddressInput(addr.address);
        dispatch(setAddress(addr.address));
        dispatch(setLocation({ lat: addr.lat, lon: addr.lon }));
    }

    const deliveryFee = totalAmount > 500 ? 0 : 50;
    const amountWithDeliveryFee = totalAmount + deliveryFee;
    const onDragEnd = (e) => {
        const { lat, lng } = e.target._latlng;
        dispatch(setLocation({ lat, lon: lng }));
        getAddressByLatLng(lat, lng);
    }
    const getAddressByLatLng = async (lat, lng) => {
        try {
            const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`);
            console.log(result?.data?.results[0].address_line1);
            dispatch(setAddress(result?.data?.results[0].address_line1));
            setAddressInput(result?.data?.results[0].address_line1);
        } catch (error) {
            console.log(error);
        }
    }
    const getCurrentLocation = () => {
        const latitude = userData.location.coordinates[1];
        const longitude = userData.location.coordinates[0];
        dispatch(setLocation({ lat: latitude, lon: longitude }));
        getAddressByLatLng(latitude, longitude);
    }
    const getLatLngByAddress = async () => {
        try {
            const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&format=json&apiKey=${apiKey}`);
            const { lat, lon } = result.data.results[0];
            dispatch(setLocation({ lat, lon }));
        } catch (error) {
            console.log(error);
        }
    }
    const handlePlaceOrder = async () => {
        try {
            if (paymentMethod === "online") {
                const orderResult = await axios.post(`${serverUrl}/api/order/place-order`, {
                    paymentMethod,
                    deliveryAddress: {
                        text: addressInput,
                        latitude: location.lat,
                        longitude: location.lon,
                    },
                    totalAmount: amountWithDeliveryFee,
                    cartItems,
                }, { withCredentials: true });

                const orderId = orderResult.data._id;
                const paymentRes = await axios.post(`${serverUrl}/api/payment/create-vnpay-url`, {
                    totalAmount: amountWithDeliveryFee,
                    orderId
                });

                window.location.href = paymentRes.data.paymentUrl; // Redirect sang VNPAY
            } else {
                const result = await axios.post(`${serverUrl}/api/order/place-order`, {
                    paymentMethod,
                    deliveryAddress: {
                        text: addressInput,
                        latitude: location.lat,
                        longitude: location.lon,
                    },
                    totalAmount: amountWithDeliveryFee,
                    cartItems
                }, { withCredentials: true });
                dispatch(addMyOrder(result.data));
                navigate("/order-placed");
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        setAddressInput(address);
    }, [address])

    return (
        <div className='min-h-screen  bg-[#fff9f6] flex items-center justify-center p-6'>
            <div className='absolute top-[20px] left-[20px] z-[10]' onClick={() => navigate("/")}>
                <IoArrowBack size={36} className='text-[#ff4d2d]' />
            </div>
            <div className='w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6'>
                <h1 className='text-2xl font-bold text-gray-800'>Thanh toán</h1>
                {/* Map  */}
                <section>
                    <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800'>
                        <IoLocationSharp size={16} className='text-[#ff4d2d]' />Địa chỉ nhân hàng</h2>

                    {savedAddresses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                            <p className="text-gray-500 mb-3 text-sm">Bạn chưa có địa chỉ nhận hàng nào</p>
                            <button
                                onClick={() => navigate("/my-addresses?select=true")}
                                className="px-4 py-2 bg-white border border-[#ff4d2d] text-[#ff4d2d] font-bold rounded-lg hover:bg-orange-50 transition flex items-center gap-2"
                            >
                                <IoAdd size={18} /> Thêm địa chỉ mới
                            </button>
                        </div>
                    ) : (
                        <div className="border border-[#ff4d2d] bg-orange-50/30 p-4 rounded-xl relative">
                            {/* Selected Address Display */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <span className="font-bold text-gray-800">{userData?.fullName}</span>
                                <span className="text-gray-400 hidden sm:inline">|</span>
                                <span className="text-gray-700 font-medium">{userData?.mobile}</span>
                            </div>
                            <div className="flex items-start gap-2 mb-3">
                                <span className="bg-[#ff4d2d] text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap">
                                    {savedAddresses.find(a => a.address === addressInput)?.tag || "Home"}
                                </span>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {addressInput}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mt-4">
                                <button
                                    onClick={() => navigate("/my-addresses?select=true")}
                                    className="text-xs uppercase font-bold text-[#ff4d2d] hover:underline"
                                >
                                    Thay đổi
                                </button>
                            </div>
                        </div>
                    )}

                    {addressInput && (
                        <div className='rounded-xl border overflow-hidden mt-4 h-48'>
                            <MapContainer className='w-full h-full' center={[location?.lat || 0, location?.lon || 0]}
                                zoom={15} scrollWheelZoom={false} dragging={false} zoomControl={false}>
                                <TileLayer attribution='&copy; Contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <RecenterMap location={location} />
                                <Marker position={[location?.lat || 0, location?.lon || 0]}></Marker>
                            </MapContainer>
                        </div>
                    )}
                </section>
                {/* Payment  */}
                <section>
                    <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800'>Phương thức thanh toán</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${paymentMethod === "cod" ?
                            "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border=gray-300"
                            }`} onClick={() => setPaymentMethod("cod")}>
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                <MdDeliveryDining className="text-green-600 text-xl" />
                            </span>
                            <div>
                                <p className="font-medium text-gray-800">Thanh toán khi nhận hàng</p>
                                <p className="text-xs text-gray-500">Thanh toán khi nhận hàng</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${paymentMethod === "online" ?
                            "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border=gray-300"
                            }`} onClick={() => setPaymentMethod("online")}>
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                                <FaMobileScreenButton className="text-purple-700 text-xl" />
                            </span>
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                                <FaCreditCard className="text-blue-700 text-xl" />
                            </span>
                            <div>
                                <p className="font-medium text-gray-800">Thẻ tín dụng / Debit Card</p>
                                <p className="text-xs text-gray-500">Thanh toán an toàn trực tuyến</p>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Order Sumary  */}
                <section>
                    <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800'>Tóm tắt đơn hàng</h2>
                    <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
                        {cartItems.map((item, index) => (
                            <div className="flex justify-between text-sm text-gray-700" key={index}>
                                <span>{item.name} x {item.quantity}</span>
                                <span>{item.price * item.quantity}</span>
                            </div>
                        ))}
                        <hr className="border-gray-400 my-2" />
                        <div className="flex justify-between text-sm font-semibold text-gray-800">
                            <span>Tổng tiền</span>
                            <span>{totalAmount} ₫</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700">
                            <span>Phí giao hàng</span>
                            <span>{deliveryFee == 0 ? "Free" : deliveryFee} ₫</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-[#ff4d2d] pt-2">
                            <span>Tổng thanh toán</span>
                            <span>{amountWithDeliveryFee} ₫</span>
                        </div>
                    </div>
                </section>
                <button className="w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold"
                    onClick={handlePlaceOrder}>
                    {paymentMethod == "cod" ? "Đặt hàng" : "Thanh toán"}</button>
            </div>
        </div>
    )
}

export default CheckOut
