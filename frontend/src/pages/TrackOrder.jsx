import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { serverUrl } from "../App";
import { useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import DeliveryPersonTracking from "../components/DeliveryPersonTracking";

function TrackOrder() {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [currentOrder, setCurrentOrder] = useState();
    const handleGetOrder = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true });
            console.log(result.data);
            setCurrentOrder(result.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        handleGetOrder();
    }, [orderId])
    return (
        <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
            <div className='relative flex items-center gap-4 top-[20px] left-[20px] z-[10] mb-[10px]'
                onClick={() => navigate("/")}>
                <IoArrowBack size={36} className='text-[#ff4d2d]' />
                <h1 className="text-2xl font-bold md:text-center">Track Order</h1>
            </div>
            {currentOrder?.shopOrders?.map((shopOrder, index) => (
                <div className="bg-white p-4 rounded-2xl shadow-md border border-orange-100 space-y-4" key={index}>
                    <div>
                        <p className="tetx-lg font-bold mb-2 text-[#ff4d2d]">{shopOrder.shop.name}</p>
                        <p className="font-semibold"><span>Items: </span>{shopOrder.shopOrderItems?.map(i => i.name).join(", ")}</p>
                        <p><span className="font-semibold">Subtotal: </span>{shopOrder.subTotal}</p>
                        <p className="mt-6"><span className="font-semibold">Delivery Address: </span>
                            {currentOrder.deliveryAddress.text}</p>
                    </div>
                    {shopOrder.status != "delivered" ? <>
                        <h2>Delivery Person</h2>
                        {shopOrder.assignedDeliveryPerson ?
                            <div className="text-sm text-gray-700">
                                <p><span className="font-semibold">Delivery name: </span>{shopOrder.assignedDeliveryPerson.fullName}</p>
                                <p><span className="font-semibold">Contact: </span>{shopOrder.assignedDeliveryPerson.mobile}</p>
                            </div> : <p className="font-semibold">Delivery not assigned</p>}
                    </> : <p className="text-green-600 font-semibold text-lg">Delived</p>}

                    {shopOrder.assignedDeliveryPerson &&
                        <div>
                            <DeliveryPersonTracking data={{
                                deliveryPersonLocation: {
                                    lat: shopOrder.assignedDeliveryPerson.location.coordinates[1],
                                    lon: shopOrder.assignedDeliveryPerson.location.coordinates[0]
                                },
                                customerLocation: {
                                    lat: currentOrder.deliveryAddress.latitude,
                                    lon: currentOrder.deliveryAddress.longitude
                                }
                            }} />
                        </div>}
                </div>
            ))}
        </div>
    )
}

export default TrackOrder
