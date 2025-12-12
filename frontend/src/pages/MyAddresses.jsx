import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { IoArrowBack, IoAdd, IoLocationSharp } from "react-icons/io5";
import { serverUrl } from '../App';
import { setAddress, setLocation, setSelectedAddress } from '../redux/mapSlice';
import AddressCard from '../components/AddressCard';

const MyAddresses = () => {
    const { userData } = useSelector(state => state.user);
    const [addresses, setAddresses] = useState([]);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isSelectionMode = searchParams.get('select') === 'true';
    const dispatch = useDispatch();

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
        navigate(`/update-address/${addr._id}`);
    };

    const onSelectAddress = (addr) => {
        if (isSelectionMode) {
            dispatch(setAddress(addr.address));
            dispatch(setLocation({ lat: addr.lat, lon: addr.lon }));
            dispatch(setSelectedAddress(addr)); // Store complete address object
            navigate(-1); // Go back to Checkout
        }
    };

    return (
        <div className='min-h-screen bg-[#fff9f6] p-4 font-sans'>
            <div className='max-w-3xl mx-auto'>
                {/* Header */}
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-4 cursor-pointer group w-fit' onClick={() => navigate(-1)}>
                        <div className="p-2 bg-white rounded-full shadow-sm text-[#ff4d2d] group-hover:bg-[#ff4d2d] group-hover:text-white transition-all">
                            <IoArrowBack size={24} />
                        </div>
                        <h1 className='text-2xl font-bold text-gray-800'>Địa chỉ của tôi</h1>
                    </div>
                    <button
                        onClick={() => navigate('/add-address')}
                        className='flex items-center gap-2 bg-white text-[#ff4d2d] font-bold px-4 py-2.5 rounded-full shadow-sm hover:bg-[#ff4d2d] hover:text-white transition-all border border-orange-100 hover:border-[#ff4d2d]'>
                        <IoAdd size={20} /> <span className="hidden sm:inline">Thêm địa chỉ</span>
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {addresses.length === 0 && (
                        <div className="text-center py-10 bg-white rounded-2xl shadow-sm">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <IoLocationSharp size={30} />
                            </div>
                            <p className="text-gray-500 mb-4">Bạn chưa lưu địa chỉ nào.</p>
                            <button onClick={() => navigate('/add-address')} className="text-[#ff4d2d] font-bold hover:underline">Thêm ngay</button>
                        </div>
                    )}

                    {addresses.map((addr) => (
                        <AddressCard
                            key={addr._id}
                            address={addr}
                            userData={userData}
                            isSelectionMode={isSelectionMode}
                            onSelect={onSelectAddress}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onSetDefault={handleSetDefault}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyAddresses;
