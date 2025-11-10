import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';

const deliveryPersonIcon = new L.Icon({
    iconUrl: scooter,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
})
const customerIcon = new L.Icon({
    iconUrl: home,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
})

function DeliveryPersonTracking({ data }) {
    const deliveryPersonLat = data.deliveryPersonLocation.lat;
    const deliveryPersonLon = data.deliveryPersonLocation.lon;

    const customerLat = data.customerLocation.lat;
    const customerLon = data.customerLocation.lon;

    const path = [
        [deliveryPersonLat, deliveryPersonLon],
        [customerLat, customerLon],
    ]

    const center = [deliveryPersonLat, deliveryPersonLon];
    return (
        <div className="w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md">
            <MapContainer className='w-full h-full' center={center} zoom={13} scrollWheelZoom={true}>
                <TileLayer attribution='&copy; 
                    <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[deliveryPersonLat, deliveryPersonLon]} icon={deliveryPersonIcon}>
                    <Popup>Delivery Person</Popup>
                </Marker>
                <Marker position={[customerLat, customerLon]} icon={customerIcon}>
                    <Popup>Customer</Popup>
                </Marker>
                <Polyline positions={path} color="blue" weight={5} />
            </MapContainer>
        </div>
    )
}

export default DeliveryPersonTracking
