import React from 'react';
import { IoPencil, IoTrash } from "react-icons/io5";

const AddressCard = ({ address, userData, isSelectionMode, onSelect, onEdit, onDelete, onSetDefault }) => {
    return (
        <div
            onClick={() => onSelect(address)}
            className={`bg-white p-6 rounded-2xl shadow-md border-2 transition-all relative group hover:shadow-lg
            ${isSelectionMode ? 'cursor-pointer hover:border-[#ff4d2d] hover:bg-orange-50/20' : 'border-gray-100 hover:border-gray-200'}
            `}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-gray-800 text-base">{userData?.fullName}</span>
                        <div className="h-4 w-[1px] bg-gray-300"></div>
                        <span className="text-gray-600 text-sm">{userData?.mobile}</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-1 font-medium leading-relaxed">{address.address}</p>
                    <p className="text-gray-500 text-xs mb-3">{address.commune}, {address.district}, {address.city}</p>
                    <div className="flex gap-2 mt-2">
                        <span className="bg-orange-50 border border-orange-200 text-[#ff4d2d] text-xs px-2 py-1 rounded-lg font-semibold">{address.tag}</span>
                        {address.isDefault && <span className="bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4a] text-white text-xs px-2 py-1 rounded-lg font-semibold shadow-sm">Mặc định</span>}
                    </div>
                </div>

                <div className="flex flex-col gap-2 pl-4 border-l-2 border-gray-100 ml-4">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(address); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all text-sm font-medium shadow-sm group"
                        title="Sửa">
                        <IoPencil size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline">Sửa</span>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(address._id); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all text-sm font-medium shadow-sm group"
                        title="Xóa">
                        <IoTrash size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline">Xóa</span>
                    </button>
                </div>
            </div>

            {!address.isDefault && (
                <button
                    onClick={(e) => { e.stopPropagation(); onSetDefault(address._id); }}
                    className="mt-4 px-4 py-2 border-2 border-dashed border-gray-200 text-sm text-gray-600 hover:text-[#ff4d2d] hover:border-[#ff4d2d] hover:bg-orange-50/30 rounded-xl transition-all font-semibold">
                    ⭐ Đặt làm mặc định
                </button>
            )}
        </div>
    );
};

export default AddressCard;
