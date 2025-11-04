import React from 'react'

function UserOrderCard({ data }) {
  const formateDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return (
    <div className='bg-white rounded-lg shadow p-4 space-y-4'>
      <div className='flex justify-between border-b pb-2'>
        <div>
          <p className='font-semibold'>order #{data._id.slice(-6)}</p>
          <p className='text-sm text-gray-500'>Date: {formateDate(data.createdAt)}</p>
        </div>
        <div className='text-right'>
          <p className='text-sm text-gray-500'>{data.paymentMethod.toUpperCase()}</p>
          <p className='font-medium text-blue-600'>{data.shopOrders?.[0].status}</p>
        </div>
      </div>
      {data.shopOrders.map((shopOrder, index) => (
        <div className='border rounded-lg p-3 bg-[#fffaf7] space-y-3' key={index}>
          <p>{shopOrder.shop.name}</p>
          <div className='flex space-x-4 overflow-x-auto pb-2'>
            {shopOrder.shopOrderItems.map((item, index) => (
              <div className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white' key={index}>
                <img src={item.item.image} alt="" className='w-full h-24 object-cover rounded' />
                <p className='text-sm font-semibold mt-1'>{item.name}</p>
                <p className='text-sm text-gray-500'>{item.price} x {item.quantity}</p>
              </div>
            ))}
          </div>
          <div className='flex justify-between items-center border-t pt-2'>
            <p className='font-semibold'>Subtotal: {shopOrder.subTotal} VND</p>
            <p className='text-sm font-medium text-blue-600'>{shopOrder.status}</p>
          </div>
        </div>
      ))}

      <div className='flex justify-between items-center border-t pt-2'>
        <p className='font-semibold'>Total: {data.totalAmount} VND</p>
        <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm'>Track Order</button>
      </div>
    </div>
  )
}

export default UserOrderCard
