import User from './../models/userModel.js';
import uploadOnCloudinary from '../utils/cloudinary.js';

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ message: "Không tìm thấy ID người dùng" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "Không tìm thấy người dùng" });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Lấy thông tin người dùng thất bại. Lỗi: ${error.message}` });
    }
}

export const updateUserLocation = async (req, res) => {
    try {
        const { lat, lon } = req.body;

        // Validate userId from auth middleware
        if (!req.userId) {
            return res.status(401).json({ message: "Chưa xác thực - Không tìm thấy ID người dùng" });
        }

        // Validate request body
        if (!lat || !lon) {
            return res.status(400).json({ message: "Vĩ độ và kinh độ là bắt buộc" });
        }

        const user = await User.findByIdAndUpdate(req.userId, {
            location: {
                type: "Point",
                coordinates: [lon, lat]
            }
        }, { new: true })

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        return res.status(200).json({ message: "Cập nhật vị trí thành công" });
    } catch (error) {
        console.error("Lỗi cập nhật vị trí:", error);
        return res.status(500).json({ message: `Cập nhật vị trí thất bại. Lỗi: ${error.message}` });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { fullName, mobile, gender, birthDay, typeOfVehicle, licensePlate } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Chưa xác thực" });
        }

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (mobile) updateData.mobile = mobile;
        if (gender) updateData.gender = gender;
        if (birthDay) updateData.birthDay = birthDay;
        if (typeOfVehicle) updateData.typeOfVehicle = typeOfVehicle;
        if (licensePlate) updateData.licensePlate = licensePlate;

        // Handle file uploads
        if (req.files) {
            if (req.files['avatar']) {
                updateData.avatar = await uploadOnCloudinary(req.files['avatar'][0].path);
            }
            if (req.files['citizenIdentityFront']) {
                updateData.citizenIdentityFront = await uploadOnCloudinary(req.files['citizenIdentityFront'][0].path);
            }
            if (req.files['citizenIdentityBack']) {
                updateData.citizenIdentityBack = await uploadOnCloudinary(req.files['citizenIdentityBack'][0].path);
            }
            if (req.files['driverLicenseFront']) {
                updateData.driverLicenseFront = await uploadOnCloudinary(req.files['driverLicenseFront'][0].path);
            }
            if (req.files['driverLicenseBack']) {
                updateData.driverLicenseBack = await uploadOnCloudinary(req.files['driverLicenseBack'][0].path);
            }
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        return res.status(200).json({ message: "Cập nhật hồ sơ thành công", user });
    } catch (error) {
        console.error("Lỗi cập nhật hồ sơ:", error);
        return res.status(500).json({ message: `Cập nhật hồ sơ thất bại. Lỗi: ${error.message}` });
    }
}

