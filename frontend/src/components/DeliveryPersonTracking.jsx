import scooter from "../assets/scooter.png";
import home from "../assets/home.png";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { useEffect, useState } from 'react';

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

    const [routePath, setRoutePath] = useState([]);
    const [isLoadingRoute, setIsLoadingRoute] = useState(true);

    // Fetch actual route from OSRM API
    useEffect(() => {
        const fetchRoute = async () => {
            try {
                setIsLoadingRoute(true);
                // OSRM API - Free, no API key needed!
                const url = `https://router.project-osrm.org/route/v1/driving/${deliveryPersonLon},${deliveryPersonLat};${customerLon},${customerLat}?overview=full&geometries=geojson`;

                const response = await fetch(url);
                const result = await response.json();

                if (result.code === 'Ok' && result.routes.length > 0) {
                    // Convert GeoJSON coordinates [lon, lat] to Leaflet format [lat, lon]
                    const coordinates = result.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    setRoutePath(coordinates);
                } else {
                    // Fallback to straight line if routing fails
                    setRoutePath([
                        [deliveryPersonLat, deliveryPersonLon],
                        [customerLat, customerLon]
                    ]);
                }
            } catch (error) {
                console.error('Error fetching route:', error);
                // Fallback to straight line
                setRoutePath([
                    [deliveryPersonLat, deliveryPersonLon],
                    [customerLat, customerLon]
                ]);
            } finally {
                setIsLoadingRoute(false);
            }
        };

        fetchRoute();
    }, [deliveryPersonLat, deliveryPersonLon, customerLat, customerLon]);

    const center = [deliveryPersonLat, deliveryPersonLon];

    return (
        <div className="w-full h-[400px] mt-3 rounded-xl overflow-hidden shadow-md">
            <MapContainer className='w-full h-full' center={center} zoom={13} scrollWheelZoom={true}>
                <TileLayer attribution='&copy; 
                    <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[deliveryPersonLat, deliveryPersonLon]} icon={deliveryPersonIcon}>
                    <Popup>Người giao hàng</Popup>
                </Marker>
                <Marker position={[customerLat, customerLon]} icon={customerIcon}>
                    <Popup>Khách hàng</Popup>
                </Marker>
                {!isLoadingRoute && routePath.length > 0 && (
                    <Polyline positions={routePath} color="#2563eb" weight={4} opacity={0.7} />
                )}
            </MapContainer>
        </div>
    )
}

export default DeliveryPersonTracking
