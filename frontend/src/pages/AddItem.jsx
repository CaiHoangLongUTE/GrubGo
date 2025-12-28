import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaUtensils } from "react-icons/fa";
import { useState } from "react";
import { serverUrl } from "../App";
import axios from "axios";
import { setMyShopData } from "../redux/ownerSlice";
import toast from "react-hot-toast";
import SearchableSelect from "../components/SearchableSelect";

function AddItem() {
    const navigate = useNavigate();
    const { myShopData } = useSelector(state => state.owner);
    const { categories } = useSelector(state => state.user);
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState("");
    const [foodType, setFoodType] = useState("food");
    const [frontendImage, setFrontendImage] = useState(null);
    const [backendImage, setBackendImage] = useState(null);
    const dispatch = useDispatch();

    const categoryOptions = categories.map(cate => ({ value: cate._id, label: cate.name }));

    const handleImage = (e) => {
        const file = e.target.files[0];
        setBackendImage(file);
        setFrontendImage(URL.createObjectURL(file));
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!name || !category || !foodType || !price || !backendImage) {
                toast.error("Vui lòng điền đầy đủ thông tin và chọn hình ảnh");
                return;
            }

            const formData = new FormData();
            formData.append("name", name);
            formData.append("desc", desc);
            formData.append("category", category);
            formData.append("foodType", foodType);
            formData.append("price", price);
            if (backendImage) {
                formData.append("image", backendImage);
            }
            const result = await axios.post(`${serverUrl}/api/item/add-item`, formData, { withCredentials: true });
            toast.success("Thêm món ăn thành công", { duration: 2000 });
            navigate("/");
            dispatch(setMyShopData(result.data));
            console.log(result.data);
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div className='min-h-screen bg-gray-50 p-6 font-sans'>
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='flex items-center gap-4 mb-8 cursor-pointer group w-fit' onClick={() => navigate("/")}>
                    <div className="p-2 bg-white rounded-full shadow-sm text-[#ff4d2d] group-hover:bg-[#ff4d2d] group-hover:text-white transition-all">
                        <IoArrowBack size={24} />
                    </div>
                    <h1 className='text-2xl font-bold text-gray-800'>Thêm món ăn</h1>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: General Info */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                <FaUtensils className="text-[#ff4d2d]" />
                                Thông tin món ăn
                            </h2>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên món ăn</label>
                                    <input type="text" placeholder="Nhập tên món ăn" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm"
                                        onChange={(e) => setName(e.target.value)} value={name} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả (tùy chọn)</label>
                                    <textarea
                                        placeholder="Nhập mô tả chi tiết về món ăn..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm resize-none min-h-[120px]"
                                        onChange={(e) => setDesc(e.target.value)}
                                        value={desc}
                                        rows="4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá bán (VNĐ)</label>
                                    <div className="relative">
                                        <input type="number" placeholder="0" className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm pl-4"
                                            onChange={(e) => setPrice(e.target.value)} value={price} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Image & Classification */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                PHÂN LOẠI & HÌNH ẢNH
                            </h2>
                            <div className="space-y-5">
                                <div>
                                    <SearchableSelect
                                        label="Danh mục"
                                        options={categoryOptions}
                                        value={category}
                                        onChange={setCategory}
                                        placeholder="Chọn danh mục"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại món</label>
                                    <select className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] transition-all text-sm appearance-none"
                                        onChange={(e) => setFoodType(e.target.value)} value={foodType}>
                                        <option value="food">Đồ ăn</option>
                                        <option value="drink">Đồ uống</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Hình ảnh</label>
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-all text-center">
                                        <input type="file" accept="image/*" id="item-image" className="hidden" onChange={handleImage} />
                                        <label htmlFor="item-image" className="cursor-pointer block w-full h-full">
                                            {frontendImage ? (
                                                <img src={frontendImage} alt="Preview" className="w-full h-48 object-cover rounded-lg shadow-sm mx-auto" />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                                                    <span className="text-4xl mb-2">📷</span>
                                                    <span className="text-sm font-medium">Bấm để tải ảnh lên</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="w-full bg-[#ff4d2d] text-white py-4 px-6 rounded-xl hover:bg-[#e64323] font-bold text-lg shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all duration-200 cursor-pointer active:scale-[0.98]">
                            Thêm món ăn
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddItem
