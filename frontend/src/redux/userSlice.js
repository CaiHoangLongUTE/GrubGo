import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        currentCity: null,
        currentState: null,
        currentAddress: null,
        shopsInMyCity: null,
        itemsInMyCity: null,
        cartItems: [],
        totalAmount: 0,
        myOrders: [],
        searchItems: null,
        socket: null,
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },
        setCurrentCity: (state, action) => {
            state.currentCity = action.payload;
        },
        setCurrentState: (state, action) => {
            state.currentState = action.payload;
        },
        setCurrentAddress: (state, action) => {
            state.currentAddress = action.payload;
        },
        setShopsInMyCity: (state, action) => {
            state.shopsInMyCity = action.payload;
        },
        setItemsInMyCity: (state, action) => {
            state.itemsInMyCity = action.payload;
        },
        addToCart: (state, action) => {
            const cartItem = action.payload;
            const existingItem = state.cartItems.find(i => i.id === cartItem.id);
            if (existingItem) {
                existingItem.quantity += cartItem.quantity;
            } else {
                state.cartItems.push(cartItem);
            }
            console.log(state.cartItems);
            state.totalAmount = state.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.cartItems.find(i => i.id === id);
            if (item) {
                item.quantity = quantity;
            }
            state.totalAmount = state.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
        },
        removeCartItem: (state, action) => {
            state.cartItems = state.cartItems.filter(i => i.id !== action.payload);
            state.totalAmount = state.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
        },
        setMyOrders: (state, action) => {
            state.myOrders = action.payload;
        },
        addMyOrder: (state, action) => {
            state.myOrders = [action.payload, ...state.myOrders];
        },
        updateOrderStatus: (state, action) => {
            const { orderId, shopId, status } = action.payload;
            const index = state.myOrders.findIndex(o => o._id == orderId);
            if (index !== -1 && state.myOrders[index]?.shopOrders?.shop?._id == shopId) {
                state.myOrders[index] = {
                    ...state.myOrders[index],
                    shopOrders: { ...state.myOrders[index].shopOrders, status }
                };
            }
        },
        setSearchItems: (state, action) => {
            state.searchItems = action.payload;
        },
        setSocket: (state, action) => {
            state.socket = action.payload;
        }
    }
})

export const { setUserData, setCurrentCity, setCurrentState, setCurrentAddress, setShopsInMyCity, setItemsInMyCity,
    addToCart, updateQuantity, removeCartItem, setMyOrders, addMyOrder, updateOrderStatus, setSearchItems, setSocket } = userSlice.actions;
export default userSlice.reducer;
