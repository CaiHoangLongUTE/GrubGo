import User from './../models/userModel.js';
import uploadOnCloudinary from '../utils/cloudinary.js';

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ message: "UserID not found" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json(`Fetching user failed. Error: ${error.message}`);
    }
}

export const updateUserLocation = async (req, res) => {
    try {
        const { lat, lon } = req.body;

        // Validate userId from auth middleware
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized - User ID not found" });
        }

        // Validate request body
        if (!lat || !lon) {
            return res.status(400).json({ message: "Latitude and longitude are required" });
        }

        const user = await User.findByIdAndUpdate(req.userId, {
            location: {
                type: "Point",
                coordinates: [lon, lat]
            }
        }, { new: true })

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Location updated successfully" });
    } catch (error) {
        console.error("Update location error:", error);
        return res.status(500).json({ message: `Updating location failed. Error: ${error.message}` });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { fullName, mobile, gender, avatar } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (mobile) updateData.mobile = mobile;
        if (gender) updateData.gender = gender;
        if (avatar) updateData.avatar = avatar;

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({ message: `Updating profile failed. Error: ${error.message}` });
    }
}

export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }

        const imageUrl = await uploadOnCloudinary(req.file.path);

        return res.status(200).json({ message: "Avatar uploaded successfully", url: imageUrl });
    } catch (error) {
        console.error("Upload avatar error:", error);
        return res.status(500).json({ message: `Upload failed. Error: ${error.message}` });
    }
}