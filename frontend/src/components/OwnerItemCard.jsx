import axios from 'axios';
import React from 'react'
import { FaPen } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setMyShopData } from '../redux/ownerSlice';

function OwnerItemCard({ data }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleDelete = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/item/delete-item/${data._id}`, { withCredentials: true });
      dispatch(setMyShopData(result.data));
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className="flex bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 w-full max-w-xl">
      <div className="w-36 flex-shrink-0 bg-gray-50">
        <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex flex-col justify-between p-3 flex-1">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">{data.name}</h2>
          <p className="text-sm text-gray-500"><span className="font-medium text-gray-700">Danh mục:</span> {data.category?.name || data.category}</p>
          <p className="text-sm text-gray-500"><span className="font-medium text-gray-700">Loại:</span> <span className="capitalize">{data.foodType === 'food' ? 'Thức ăn' : 'Nước uống'}</span></p>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-[#ff4d2d] font-bold text-lg">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.price)}</div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-orange-50 text-[#ff4d2d] hover:bg-[#ff4d2d] hover:text-white transition-all cursor-pointer shadow-sm" onClick={() => navigate(`/edit-item/${data._id}`)}>
              <FaPen size={14} />
            </div>
            <div className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-sm" onClick={handleDelete}>
              <FaTrashAlt size={14} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerItemCard
