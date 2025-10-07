import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

const uploadOnCloudinary = async (file) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY__API_SECRET
    });
    try {
        const result = cloudinary.uploader.upload(file);
        fs.unlinkSync(file);
        return (await result).secure_url;
    } catch (error) {
        fs.unlinkSync(file);
        console.log(error);
    }
}

export default uploadOnCloudinary