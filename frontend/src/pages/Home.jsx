import React from 'react'
import { useSelector } from 'react-redux';
import UserDashBoard from '../components/UserDashBoard';
import OwnerDashBoard from '../components/OwnerDashBoard';
import DeliveryDashBoard from '../components/DeliveryDashBoard';
import Nav from '../components/Nav';

function Home() {
    const { userData } = useSelector((state) => state.user);
    return (
        <>
            <Nav />   {/* ✅ Chỉ hiện trong Home */}
            <div className='w-[100vw] min-h-[100vh] pt-[100px] flex flex-col items-center bg-[#fff9f9]'>
                {userData.role=="user" && <UserDashBoard/>}
                {userData.role=="owner" && <OwnerDashBoard/>}
                {userData.role=="delivery" && <DeliveryDashBoard/>}
            </div>
        </>
    )
}

export default Home
