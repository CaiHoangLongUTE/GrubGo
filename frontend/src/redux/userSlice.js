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
        categories: [],
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
        updateOwnerOrderStatus: (state, action) => {
            const { orderId, shopId, status } = action.payload;
            const order = state.myOrders.find(o => o._id == orderId);
            if (order.shopOrders && order.shopOrders.shop._id == shopId) {
                order.shopOrders.status = status;
            }
        },

        updateUserOrderStatus: (state, action) => {
            const { orderId, shopId, status } = action.payload;
            const order = state.myOrders.find(o => o._id == orderId);
            if (order) {
                const shopOrder = order.shopOrders?.find(so => so.shop?._id == shopId);
                if (shopOrder) {
                    shopOrder.status = status;
                }
            }
        },
        updatePaymentStatus: (state, action) => {
            const { orderId } = action.payload;
            const order = state.myOrders.find(o => o._id == orderId);
            if (order) {
                order.payment = true;
                // Update shopOrders payment status
                if (order.shopOrders) {
                    order.shopOrders.payment = true;
                }
            }
        },
        updateUserOrderReview: (state, action) => {
            const { orderId, shopOrderId } = action.payload;
            const order = state.myOrders.find(o => o._id == orderId);
            if (order) {
                const shopOrder = order.shopOrders?.find(so => so._id == shopOrderId);
                if (shopOrder) {
                    shopOrder.isReviewed = true;
                }
            }
        },
        setSearchItems: (state, action) => {
            state.searchItems = action.payload;
        },
        setSocket: (state, action) => {
            state.socket = action.payload;
        },
        setCategories: (state, action) => {
            state.categories = action.payload;
        },
        assignDeliveryPerson: (state, action) => {
            const { orderId, shopOrderId, deliveryPerson, status } = action.payload;
            const order = state.myOrders.find(o => o._id == orderId);
            if (order) {
                if (Array.isArray(order.shopOrders)) {
                    // User view
                    const shopOrder = order.shopOrders.find(so => so._id == shopOrderId);
                    if (shopOrder) {
                        shopOrder.assignedDeliveryPerson = deliveryPerson;
                        shopOrder.status = status;
                    }
                } else {
                    // Owner view
                    if (order.shopOrders._id == shopOrderId) {
                        order.shopOrders.assignedDeliveryPerson = deliveryPerson;
                        order.shopOrders.status = status;
                    }
                }
            }
        }
    }
})

export const { setUserData, setCurrentCity, setCurrentState, setCurrentAddress, setShopsInMyCity, setItemsInMyCity,
    addToCart, updateQuantity, removeCartItem, setMyOrders, addMyOrder, updateOwnerOrderStatus, updateUserOrderStatus,
    updatePaymentStatus, updateUserOrderReview, setSearchItems, setSocket, setCategories, assignDeliveryPerson } = userSlice.actions;
export default userSlice.reducer;
