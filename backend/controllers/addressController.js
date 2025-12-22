import Address from "../models/addressModel.js";

// Add new address
export const addAddress = async (req, res) => {
    try {
        const { tag, city, state, address, lat, lon, isDefault } = req.body;
        const userId = req.userId;

        if (isDefault) {
            // If new address is default, unset other defaults
            await Address.updateMany({ user: userId }, { isDefault: false });
        }

        const newAddress = await Address.create({
            user: userId,
            tag,
            city,
            state,
            address,
            lat,
            lon,
            isDefault
        });

        // specific check: if this is the first address, make it default automatically
        const addressCount = await Address.countDocuments({ user: userId });
        if (addressCount === 1) {
            newAddress.isDefault = true;
            await newAddress.save();
        }

        return res.status(201).json(newAddress);
    } catch (error) {
        return res.status(500).json({ message: `Thêm địa chỉ thất bại: ${error.message}` });
    }
};

// Get all addresses for user
export const getAllAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.userId }).sort({ isDefault: -1, createdAt: -1 });
        return res.status(200).json(addresses);
    } catch (error) {
        return res.status(500).json({ message: `Lấy danh sách địa chỉ thất bại: ${error.message}` });
    }
};

// Update address
export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { tag, city, state, address, lat, lon, isDefault } = req.body;
        const userId = req.userId;

        if (isDefault) {
            await Address.updateMany({ user: userId }, { isDefault: false });
        }

        const updatedAddress = await Address.findOneAndUpdate(
            { _id: id, user: userId },
            { tag, city, state, address, lat, lon, isDefault },
            { new: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
        }

        return res.status(200).json(updatedAddress);
    } catch (error) {
        return res.status(500).json({ message: `Cập nhật địa chỉ thất bại: ${error.message}` });
    }
};

// Delete address
export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAddress = await Address.findOneAndDelete({ _id: id, user: req.userId });

        if (!deletedAddress) {
            return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
        }

        return res.status(200).json({ message: "Xóa địa chỉ thành công" });
    } catch (error) {
        return res.status(500).json({ message: `Xóa địa chỉ thất bại: ${error.message}` });
    }
};

// Set default address
export const setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        await Address.updateMany({ user: userId }, { isDefault: false });

        const updatedAddress = await Address.findOneAndUpdate(
            { _id: id, user: userId },
            { isDefault: true },
            { new: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
        }

        return res.status(200).json(updatedAddress);
    } catch (error) {
        return res.status(500).json({ message: `Đặt địa chỉ mặc định thất bại: ${error.message}` });
    }
};
