import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from './../models/shopModel.js';

export const createEditShop = async (req, res) => {
    try {
        const { name, city, state, address } = req.body;
        let image;
        if (req.file) {
            console.log(req.file);
            image = await uploadOnCloudinary(req.file.path);
        }
        let shop = await Shop.findOne({ owner: req.userId });
        if (!shop) {
            shop = await Shop.create({ name, city, state, address, image, owner: req.userId, items: [] });
        }
        else {
            shop = await Shop.findByIdAndUpdate(shop._id, { name, city, state, address, image, owner: req.userId }, { new: true });
        }
        await shop.populate("owner items");
        return res.status(201).json(shop);
    } catch (error) {
        return res.status(500).json({ message: `Create shop failed. Error: ${error.message}` });
    }
};

export const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId }).populate("owner items");
        if(!shop) {
            return null;
        }
        return res.status(200).json(shop);
    } catch (error) {
        return res.status(500).json({ message: `Get my shop failed. Error: ${error.message}` });
    }
};