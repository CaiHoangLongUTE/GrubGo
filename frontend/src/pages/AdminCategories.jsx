import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import toast from 'react-hot-toast';
import { FaPlus, FaPen, FaTrashAlt, FaSpinner } from 'react-icons/fa';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', image: null });
    const [submitting, setSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${serverUrl}/api/category/all`);
            setCategories(res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Không thể tải categories");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        data.append('name', formData.name);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            if (editMode) {
                await axios.put(`${serverUrl}/api/category/update/${currentCategory._id}`, data, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Cập nhật category thành công");
            } else {
                await axios.post(`${serverUrl}/api/category/create`, data, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Tạo category thành công");
            }
            fetchCategories();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || "Thao tác thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa category này?')) return;

        try {
            await axios.delete(`${serverUrl}/api/category/delete/${id}`, { withCredentials: true });
            toast.success("Xóa category thành công");
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || "Xóa thất bại");
        }
    };

    const openCreateModal = () => {
        setEditMode(false);
        setCurrentCategory(null);
        setFormData({ name: '', image: null });
        setImagePreview(null);
        setShowModal(true);
    };

    const openEditModal = (category) => {
        setEditMode(true);
        setCurrentCategory(category);
        setFormData({ name: category.name, image: null });
        setImagePreview(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ name: '', image: null });
        setImagePreview(null);
        setSubmitting(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return <div className="p-8"><div className="animate-pulse text-gray-500">Đang tải...</div></div>;
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý danh mục</h1>
                <button
                    onClick={openCreateModal}
                    className="px-6 py-3 bg-[#ff4d2d] text-white rounded-lg hover:bg-[#e63c1d] flex items-center gap-2 shadow-lg"
                >
                    <FaPlus /> Thêm danh mục
                </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((category) => (
                    <div key={category._id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100">
                        <div className="relative h-48">
                            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <h3 className="absolute bottom-3 left-3 text-white font-bold text-lg">{category.name}</h3>
                        </div>
                        <div className="p-4 flex justify-end gap-2">
                            <button
                                onClick={() => openEditModal(category)}
                                className="p-2.5 rounded-xl bg-orange-50 text-[#ff4d2d] hover:bg-[#ff4d2d] hover:text-white transition-all shadow-sm"
                            >
                                <FaPen size={14} />
                            </button>
                            <button
                                onClick={() => handleDelete(category._id)}
                                className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            >
                                <FaTrashAlt size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">
                            {editMode ? 'Cập nhật Category' : 'Tạo Category Mới'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tên Category</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] bg-gray-50 transition-all"
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hình ảnh {editMode && '(Để trống nếu không muốn thay đổi)'}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]/20 focus:border-[#ff4d2d] bg-gray-50 transition-all"
                                    required={!editMode}
                                    disabled={submitting}
                                />
                            </div>

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="mt-3">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Xem trước:</p>
                                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border-2 border-gray-200" />
                                </div>
                            )}

                            {/* Current Image (Edit Mode) */}
                            {editMode && currentCategory?.image && !imagePreview && (
                                <div className="mt-3">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Ảnh hiện tại:</p>
                                    <img src={currentCategory.image} alt="Current" className="w-full h-48 object-cover rounded-lg border-2 border-gray-200" />
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={submitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-[#ff4d2d] text-white rounded-xl hover:bg-[#e63c1d] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        editMode ? 'Cập nhật' : 'Tạo mới'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
