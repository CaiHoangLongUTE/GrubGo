import { FaCircleCheck } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

function OrderPlaced() {
  const navigate = useNavigate();
  return (
    <div className='min-h-screen bg-[#fff9f6] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden'>
      <FaCircleCheck className="text-green-500 text-6xl mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Đặt hàng thành công</h1>
      <p className="text-gray-600 max-w-md mb-6">Đơn hàng của bạn đã được đặt thành công</p>
      <button className="bg-[#ff2d2d] hover:bg-[#e64526] text-white px-6 py-3 rounded-lg text-lg
      font-medium transition" onClick={() => navigate("/my-orders")}>Quay lại đơn hàng</button>
    </div>
  )
}

export default OrderPlaced
