// Utility function to translate order status from English to Vietnamese
export const translateOrderStatus = (status) => {
    const statusMap = {
        'pending': 'Chờ xác nhận',
        'preparing': 'Đang chuẩn bị',
        'out of delivery': 'Đang giao hàng',
        'delivered': 'Đã giao hàng',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
};

// Utility function to get status color for styling
export const getStatusColor = (status) => {
    const colorMap = {
        'pending': 'bg-yellow-100 text-yellow-700 border-yellow-300',
        'preparing': 'bg-blue-100 text-blue-700 border-blue-300',
        'out of delivery': 'bg-orange-100 text-orange-700 border-orange-300',
        'delivered': 'bg-green-100 text-green-700 border-green-300',
        'cancelled': 'bg-red-100 text-red-700 border-red-300'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700 border-gray-300';
};
