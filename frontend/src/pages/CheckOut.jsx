import { IoArrowBack, IoAdd, IoLocationSharp } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLocation, setSelectedAddress } from "../redux/mapSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import { MdDeliveryDining } from "react-icons/md";
import { FaMobileScreenButton } from "react-icons/fa6";
import { FaCreditCard } from "react-icons/fa";
import { serverUrl } from './../App';
import { addMyOrder, clearCart } from "../redux/userSlice";

function CheckOut() {
    const { location, selectedAddress } = useSelector(state => state.map);
    const { cartItems, totalAmount, userData } = useSelector(state => state.user);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [itemNotes, setItemNotes] = useState({});

    // State to hold calculated order details
    const [calculatedBill, setCalculatedBill] = useState({
        groups: [],
        totalGoods: 0,
        totalDelivery: 0,
        grandTotal: 0
    });

    useEffect(() => {
        const fetchDefaultAddress = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/address/get-all`, { withCredentials: true });

                // Always load default address on mount
                const defaultAddr = result.data.find(addr => addr.isDefault);
                if (defaultAddr) {
                    dispatch(setLocation({ lat: defaultAddr.lat, lon: defaultAddr.lon }));
                    dispatch(setSelectedAddress(defaultAddr)); // Store complete object
                }
            } catch (error) {
                console.log(error);
            }
        }
        if (userData) {
            fetchDefaultAddress();
        }
    }, [userData, dispatch]);

    // Haversine Formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180)
    }

    // New Effect to Group Items and Calculate Fees per Shop
    useEffect(() => {
        if (!location?.lat || !location?.lon || cartItems.length === 0) return;

        const groups = {};
        let totalGoods = 0;

        cartItems.forEach(item => {
            const shopId = item.shop?._id || item.shop; // Handle populated vs string
            if (!groups[shopId]) {
                groups[shopId] = {
                    shop: item.shop, // Assume shop is populated object
                    items: [],
                    subTotal: 0,
                    deliveryFee: 15000,
                    distance: 0
                };
            }
            groups[shopId].items.push(item);
            const itemTotal = item.price * item.quantity;
            groups[shopId].subTotal += itemTotal;
            totalGoods += itemTotal;
        });

        let totalDelivery = 0;

        const processedGroups = Object.values(groups).map(group => {
            // Calculate distance if shop location exists
            if (group.shop?.lat && group.shop?.lon) {
                const dist = calculateDistance(location.lat, location.lon, group.shop.lat, group.shop.lon);
                group.distance = dist;
                if (dist > 3) {
                    group.deliveryFee += Math.ceil(dist - 3) * 5000;
                }
            }
            totalDelivery += group.deliveryFee;
            return group;
        });

        setCalculatedBill({
            groups: processedGroups,
            totalGoods,
            totalDelivery,
            grandTotal: totalGoods + totalDelivery
        });

    }, [location, cartItems]);

    const handlePlaceOrder = async () => {
        try {
            // Prepare items with notes
            const itemsWithNotes = cartItems.map(item => ({
                ...item,
                note: itemNotes[item.id] || ""
            }));

            if (paymentMethod === "online") {
                const orderResult = await axios.post(`${serverUrl}/api/order/place-order`, {
                    paymentMethod,
                    deliveryAddressId: selectedAddress?._id,
                    totalAmount: calculatedBill.grandTotal,
                    cartItems: itemsWithNotes,
                }, { withCredentials: true });

                const orderId = orderResult.data._id;
                const paymentRes = await axios.post(`${serverUrl}/api/payment/create-vnpay-url`, {
                    totalAmount: calculatedBill.grandTotal,
                    orderId
                });

                window.location.href = paymentRes.data.paymentUrl; // Redirect sang VNPAY
            } else {
                const result = await axios.post(`${serverUrl}/api/order/place-order`, {
                    paymentMethod,
                    deliveryAddressId: selectedAddress?._id,
                    totalAmount: calculatedBill.grandTotal,
                    cartItems: itemsWithNotes
                }, { withCredentials: true });
                dispatch(addMyOrder(result.data));
                dispatch(clearCart());
                navigate("/order-placed");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Đặt hàng thất bại");
        }
    };

    return (
        <div className='min-h-screen bg-[#fff9f6] py-8 px-4'>
            <div className='max-w-3xl mx-auto'>
                {/* Header */}
                <div className='flex items-center gap-4 mb-6 cursor-pointer group w-fit' onClick={() => navigate("/")}>
                    <div className="p-2 bg-white rounded-full shadow-sm text-[#ff4d2d] group-hover:bg-[#ff4d2d] group-hover:text-white transition-all">
                        <IoArrowBack size={24} />
                    </div>
                    <h1 className='text-2xl font-bold text-gray-800'>Thanh toán</h1>
                </div>

                <div className='bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden'>

                    <div className="p-6 md:p-8 space-y-8">
                        {/* Map Section */}
                        <section>
                            <h2 className='text-lg font-bold mb-4 flex items-center gap-2 text-gray-800'>
                                <span className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#ff4d2d]">
                                    <IoLocationSharp size={18} />
                                </span>
                                Địa chỉ nhận hàng
                            </h2>

                            {!selectedAddress ? (
                                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group" onClick={() => navigate("/my-addresses?select=true")}>
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                        <IoAdd size={24} className="text-[#ff4d2d]" />
                                    </div>
                                    <p className="text-gray-500 font-medium">Thêm địa chỉ nhận hàng</p>
                                </div>
                            ) : (
                                <div className="border border-[#ff4d2d]/30 bg-orange-50/40 p-5 rounded-2xl relative hover:border-[#ff4d2d] transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-bold text-gray-800">{userData?.fullName}</span>
                                                <div className="h-4 w-[1px] bg-gray-300"></div>
                                                <span className="text-gray-600">{userData?.mobile}</span>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="bg-[#ff4d2d] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-md mt-0.5 shadow-sm">
                                                    {selectedAddress?.tag || "Nhà riêng"}
                                                </span>
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                                        {selectedAddress?.address}
                                                    </p>
                                                    {selectedAddress?.city && selectedAddress?.state && (
                                                        <p className="text-xs text-gray-500">
                                                            {selectedAddress.city}, {selectedAddress.state}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate("/my-addresses?select=true")}
                                            className="text-xs font-bold text-[#ff4d2d] hover:text-[#e64526] hover:underline px-3 py-1.5 hover:bg-orange-100 rounded-lg transition-all"
                                        >
                                            THAY ĐỔI
                                        </button>
                                    </div>
                                </div>
                            )}


                        </section>

                        {/* Order Summary Groups */}
                        <section>
                            <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800'>Chi tiết đơn hàng</h2>
                            <div className="space-y-4">
                                {calculatedBill.groups.map((group, idx) => (
                                    <div key={idx} className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                        <div className="bg-orange-50/50 px-5 py-3 border-b border-orange-100 flex justify-between items-center">
                                            <h3 className="font-bold text-gray-800 text-lg">{group.shop?.name || "Unknown Shop"}</h3>
                                            <span className="text-xs bg-white px-2 py-1 rounded-full border border-orange-100 text-orange-500 font-medium">
                                                {group.distance ? `${group.distance.toFixed(2)} km` : "N/A"}
                                            </span>
                                        </div>
                                        <div className="p-5 space-y-4">
                                            {group.items.map((item, i) => (
                                                <div key={i} className="flex gap-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-xl transition-colors p-2 -mx-2">
                                                    {/* Item Image */}
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>

                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</h4>
                                                                <p className="text-gray-500 text-xs mt-0.5">Giá: {item.price.toLocaleString()} ₫</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="font-bold text-[#ff4d2d] text-sm block">{(item.price * item.quantity).toLocaleString()} ₫</span>
                                                                <span className="text-gray-400 text-xs block font-medium">x{item.quantity}</span>
                                                            </div>
                                                        </div>

                                                        <input
                                                            type="text"
                                                            placeholder="Thêm ghi chú..."
                                                            className="w-full text-xs px-3 py-2 mt-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#ff4d2d] transition-all"
                                                            value={itemNotes[item.id] || ""}
                                                            onChange={(e) => setItemNotes({ ...itemNotes, [item.id]: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="bg-gray-50 p-4 rounded-xl space-y-2 mt-2">
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>Tạm tính</span>
                                                    <span className="font-medium">{group.subTotal.toLocaleString()} ₫</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>Phí giao hàng</span>
                                                    <span className="font-medium">{group.deliveryFee.toLocaleString()} ₫</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Bill Summary */}
                        <section>
                            <div className="rounded-2xl border border-orange-200 bg-orange-50/30 p-6 space-y-3">
                                <div className="flex justify-between text-base text-gray-600">
                                    <span>Tổng tiền hàng</span>
                                    <span className="font-medium">{calculatedBill.totalGoods.toLocaleString()} ₫</span>
                                </div>
                                <div className="flex justify-between text-base text-gray-600">
                                    <span>Tổng phí giao hàng</span>
                                    <span className="font-medium">{calculatedBill.totalDelivery.toLocaleString()} ₫</span>
                                </div>
                                <div className="border-t border-dashed border-orange-200 my-2 pt-4 flex justify-between items-center">
                                    <span className="text-gray-800 font-bold text-lg">Tổng thanh toán</span>
                                    <span className="text-2xl font-extrabold text-[#ff4d2d]">{calculatedBill.grandTotal.toLocaleString()} ₫</span>
                                </div>
                            </div>
                        </section>

                        {/* Payment Method */}
                        <section>
                            <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800'>Phương thức thanh toán</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className={`relative flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all cursor-pointer group hover:shadow-md ${paymentMethod === "cod" ?
                                    "border-[#ff4d2d] bg-orange-50/50 shadow-sm" : "border-gray-100 hover:border-orange-200 hover:bg-gray-50"
                                    }`} onClick={() => setPaymentMethod("cod")}>
                                    {paymentMethod === "cod" && <div className="absolute top-3 right-3 w-3 h-3 bg-[#ff4d2d] rounded-full shadow-sm"></div>}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${paymentMethod === "cod" ? "bg-white text-[#ff4d2d] shadow-sm" : "bg-gray-100 text-gray-400 group-hover:text-[#ff4d2d] group-hover:bg-white"}`}>
                                        <MdDeliveryDining size={24} />
                                    </div>
                                    <div>
                                        <p className={`font-bold text-base transition-colors ${paymentMethod === "cod" ? "text-gray-800" : "text-gray-600 group-hover:text-gray-800"}`}>Thanh toán khi nhận hàng</p>
                                        <p className="text-xs text-gray-500 mt-1">Thanh toán tiền mặt cho shipper</p>
                                    </div>
                                </div>

                                <div className={`relative flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all cursor-pointer group hover:shadow-md ${paymentMethod === "online" ?
                                    "border-[#ff4d2d] bg-orange-50/50 shadow-sm" : "border-gray-100 hover:border-orange-200 hover:bg-gray-50"
                                    }`} onClick={() => setPaymentMethod("online")}>
                                    {paymentMethod === "online" && <div className="absolute top-3 right-3 w-3 h-3 bg-[#ff4d2d] rounded-full shadow-sm"></div>}

                                    <div className="flex -space-x-2">
                                        <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-blue-600 z-10">
                                            <FaCreditCard size={18} />
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-purple-600">
                                            <FaMobileScreenButton size={18} />
                                        </div>
                                    </div>

                                    <div>
                                        <p className={`font-bold text-base transition-colors ${paymentMethod === "online" ? "text-gray-800" : "text-gray-600 group-hover:text-gray-800"}`}>Thanh toán Online</p>
                                        <p className="text-xs text-gray-500 mt-1">Thẻ tín dụng / VNPAY / Momo</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="pt-4 mt-6">
                            <button className="w-full bg-gradient-to-r from-[#ff4d2d] to-[#ff7e5f] hover:from-[#e64526] hover:to-[#ff6b4a] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                                onClick={handlePlaceOrder}>
                                {paymentMethod == "cod" ? "Đặt hàng ngay" : "Thanh toán & Đặt hàng"}
                            </button>
                        </div>
                    </div >
                </div >
            </div >
        </div >
    )
}

export default CheckOut
