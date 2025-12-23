import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from './../models/shopModel.js';
import Item from './../models/itemModel.js';

export const createEditShop = async (req, res) => {
    try {
        const { name, city, state, address, hotline, openTime, closeTime, lat, lon } = req.body;
        let image;
        if (req.file) {
            console.log(req.file);
            image = await uploadOnCloudinary(req.file.path);
        }
        let shop = await Shop.findOne({ owner: req.userId });
        if (!shop) {
            shop = await Shop.create({ name, city, state, address, lat, lon, hotline, openTime, closeTime, image, owner: req.userId });
        }
        else {
            shop = await Shop.findByIdAndUpdate(shop._id, { name, city, state, address, lat, lon, hotline, openTime, closeTime, image }, { new: true });
        }
        await shop.populate("owner");
        return res.status(201).json(shop);
    } catch (error) {
        return res.status(500).json({ message: `Tạo/Chỉnh sửa quán ăn thất bại. Lỗi: ${error.message}` });
    }
};

export const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId }).populate("owner");
        if (!shop) {
            return null;
        }

        // Fetch items for this shop
        const items = await Item.find({ shop: shop._id })
            .populate("category", "name")
            .sort({ updatedAt: -1 });

        // Return shop with items
        return res.status(200).json({
            _id: shop._id,
            name: shop.name,
            image: shop.image,
            owner: shop.owner,
            city: shop.city,
            state: shop.state,
            address: shop.address,
            lat: shop.lat,
            lon: shop.lon,
            hotline: shop.hotline,
            openTime: shop.openTime,
            closeTime: shop.closeTime,
            status: shop.status,
            createdAt: shop.createdAt,
            updatedAt: shop.updatedAt,
            ratings: shop.ratings,
            items: items
        });
    } catch (error) {
        return res.status(500).json({ message: `Lấy thông tin quán ăn thất bại. Lỗi: ${error.message}` });
    }
};

export const getShopByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        });
        if (!shops) {
            return res.status(404).json({ message: "Không tìm thấy quán ăn" });
        }
        return res.status(200).json(shops);
    } catch (error) {
        return res.status(500).json({ message: `Lấy quán ăn theo thành phố thất bại. Lỗi: ${error.message}` });
    }
}