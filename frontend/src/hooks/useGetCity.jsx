import axios from 'axios';
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentAddress, setCurrentCity, setCurrentDistrict, setCurrentCommune } from '../redux/userSlice';
import { setAddress, setLocation } from '../redux/mapSlice';

function useGetCity() {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.user);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                dispatch(setLocation({ lat: latitude, lon: longitude }));

                try {
                    const result = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                    const address = result.data.address;

                    const city = address.city || address.state || address.province || "";
                    const district = address.district || address.county || address.suburb || "";
                    const commune = address.ward || address.quarter || address.neighbourhood || "";
                    // Nominatim puts road/house number in address properties
                    const street = address.road || "";
                    const houseNumber = address.house_number || "";
                    const fullAddress = houseNumber ? `${houseNumber} ${street}` : street || result.data.display_name.split(',')[0];

                    dispatch(setCurrentCity(city));
                    dispatch(setCurrentDistrict(district));
                    dispatch(setCurrentCommune(commune));
                    dispatch(setCurrentAddress(fullAddress));
                    dispatch(setAddress(fullAddress));
                } catch (error) {
                    console.error("Error fetching location name:", error);
                }
            })
        }
    }, [userData])
}

export default useGetCity
