import axios from 'axios';
import { store } from '../redux/store';
import { setUserData } from '../redux/userSlice';
import toast from 'react-hot-toast';

export const setupAxiosInterceptors = () => {
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            const { response } = error;
            if (response && (response.status === 401 || response.status === 403)) {
                // If unauthorized or forbidden, log out user
                // Check if we are already on signin page to avoid loops
                if (!window.location.pathname.includes('/signin')) {
                    store.dispatch(setUserData(null));
                    toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                    // Optional: window.location.href = '/signin'; 
                    // Redux state change should trigger redirect via App.jsx routes
                }
            }
            return Promise.reject(error);
        }
    );
};
