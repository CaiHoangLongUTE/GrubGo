import { useState } from 'react';
import { MdClose, MdWarning } from 'react-icons/md';

function CancelOrderModal({ isOpen, onClose, onConfirm, shopName }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <MdWarning className="text-red-600 text-2xl" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Xác nhận hủy đơn</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <p className="text-gray-600 mb-2">
                        Bạn có chắc chắn muốn hủy đơn hàng từ
                    </p>
                    <p className="font-bold text-gray-800 text-lg">
                        {shopName}?
                    </p>

                    <textarea
                        className="w-full mt-4 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm resize-none"
                        placeholder="Nhập lý do hủy đơn (không bắt buộc)..."
                        rows="3"
                        id="cancel-reason"
                    ></textarea>

                    <p className="text-sm text-gray-500 mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        ⚠️ Hành động này không thể hoàn tác
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                    >
                        Không
                    </button>
                    <button
                        onClick={() => {
                            const reason = document.getElementById('cancel-reason').value;
                            onConfirm(reason);
                            onClose();
                        }}
                        className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                    >
                        Xác nhận hủy
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CancelOrderModal;
