import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaUtensils } from "react-icons/fa";
import { useEffect, useState } from "react";
import { serverUrl } from "../App";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";
import toast from "react-hot-toast";

function EditItem() {
    const navigate = useNavigate();
    const { myShopData } = useSelector(state => state.owner);
    const { categories } = useSelector(state => state.user);
    const { itemId } = useParams();
    const [currentItem, setCurrentItem] = useState(null);
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState("");
    const [foodType, setFoodType] = useState("");

    const [frontendImage, setFrontendImage] = useState("");
    const [backendImage, setBackendImage] = useState(null);
    const dispatch = useDispatch();

    const handleImage = (e) => {
        const file = e.target.files[0];
        setBackendImage(file);
        setFrontendImage(URL.createObjectURL(file));
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("desc", desc);
            formData.append("category", category);
            formData.append("foodType", foodType);
            formData.append("price", price);
            if (backendImage) {
                formData.append("image", backendImage);
            }
            const result = await axios.post(`${serverUrl}/api/item/edit-item/${itemId}`, formData, { withCredentials: true });
            toast.success("Item edit successfully", { duration: 2000 });
            navigate("/");
            dispatch(setMyShopData(result.data));
            console.log(result.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const handleGetItemById = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`, { withCredentials: true });
                setCurrentItem(result.data);
            } catch (error) {
                console.log(error);
            }
        }
        handleGetItemById();
    }, [itemId])
    useEffect(() => {
        setName(currentItem?.name || "");
        setDesc(currentItem?.desc || "");
        setPrice(currentItem?.price || 0);
        setCategory(currentItem?.category?._id || currentItem?.category || "");
        setFoodType(currentItem?.foodType || "");
        setFrontendImage(currentItem?.image || "");
    }, [currentItem])
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
                        Cập nhật món ăn
                    </div>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div >
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên món ăn</label>
                        <input type="text" placeholder="Nhập tên món ăn" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50
                        focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                            onChange={(e) => setName(e.target.value)} value={name} />
                    </div>
                    <div >
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả (tùy chọn)</label>
                        <textarea
                            placeholder="Nhập mô tả món ăn"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50
                            focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm resize-none"
                            onChange={(e) => setDesc(e.target.value)}
                            value={desc}
                            rows="3"
                        />
                    </div>
                    <div >
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Hình ảnh món ăn</label>
                        <input type="file" accept="image/*" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50
                        focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-[#ff4d2d] hover:file:bg-orange-100" onChange={handleImage} />
                        {frontendImage &&
                            <div className="mt-4">
                                <img src={frontendImage} alt="" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                            </div>}
                    </div>
                    <div >
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá</label>
                        <input type="number" placeholder="0" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50
                        focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                            onChange={(e) => setPrice(e.target.value)} value={price} />
                    </div>
                    <div >
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại món ăn</label>
                        <select className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                            onChange={(e) => setCategory(e.target.value)} value={category}>
                            <option value="">Tất cả</option>
                            {categories.map((cate) => (
                                <option key={cate._id} value={cate.name}>{cate.name}</option>
                            ))}
                        </select>
                    </div>
                    <div >
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại món ăn</label>
                        <select className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                            onChange={(e) => setFoodType(e.target.value)} value={foodType}>
                            <option value="food">Thức ăn</option>
                            <option value="drink">Nước uống</option>
                        </select>
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

export default EditItem
