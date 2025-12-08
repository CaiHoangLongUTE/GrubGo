import axios from 'axios'
import { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setCategories } from '../redux/userSlice';

function useGetCategories() {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/category/all`);
                console.log("Categories:", result.data);
                dispatch(setCategories(result.data));
            } catch (error) {
                console.log("Error fetching categories:", error);
            }
        }
        fetchCategories();
    }, [])
}

export default useGetCategories
