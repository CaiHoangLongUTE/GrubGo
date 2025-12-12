import { createSlice } from "@reduxjs/toolkit";

const mapSlice = createSlice({
    name: "map",
    initialState: {
        location: {
            lat: null,
            lon: null,
        },
        address: null,
        selectedAddress: null, // Complete address object with city, state, etc.
    },
    reducers: {
        setLocation: (state, action) => {
            const { lat, lon } = action.payload;
            state.location.lat = lat;
            state.location.lon = lon;
        },
        setAddress: (state, action) => {
            state.address = action.payload;
        },
        setSelectedAddress: (state, action) => {
            state.selectedAddress = action.payload;
        }
    }
})

export const { setLocation, setAddress, setSelectedAddress } = mapSlice.actions;
export default mapSlice.reducer;