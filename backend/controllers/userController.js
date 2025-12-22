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
        const { fullName, mobile, gender, avatar } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Chưa xác thực" });
        }

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (mobile) updateData.mobile = mobile;
        if (gender) updateData.gender = gender;
        if (avatar) updateData.avatar = avatar;

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

export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Không có tệp hình ảnh nào được cung cấp" });
        }

        const imageUrl = await uploadOnCloudinary(req.file.path);

        return res.status(200).json({ message: "Tải ảnh đại diện lên thành công", url: imageUrl });
    } catch (error) {
        console.error("Lỗi tải ảnh đại diện:", error);
        return res.status(500).json({ message: `Tải lên thất bại. Lỗi: ${error.message}` });
    }
}