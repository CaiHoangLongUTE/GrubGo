import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import UserDashBoard from '../components/UserDashBoard';
import OwnerDashBoard from '../components/OwnerDashBoard';
import DeliveryDashBoard from '../components/DeliveryDashBoard';

function Home() {
    const { userData } = useSelector((state) => state.user);
    const navigate = useNavigate();

    // Redirect admin to admin dashboard
    useEffect(() => {
        if (userData?.role === 'admin') {
            navigate('/admin');
        }
    }, [userData?.role, navigate]);

    return (
        <div className='w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-[#fff9f9]'>
            {userData.role == "user" && <UserDashBoard />}
            {userData.role == "owner" && <OwnerDashBoard />}
            {userData.role == "delivery" && <DeliveryDashBoard />}
        </div>
    )
}

export default Home
