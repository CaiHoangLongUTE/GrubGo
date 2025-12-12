import Shop from "../models/shopModel.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import Item from './../models/itemModel.js';
import Category from './../models/categoryModel.js';

export const addItem = async (req, res) => {
    try {
        const { name, desc, category, foodType, price } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        if (!image) {
            return res.status(400).json({ message: "Image is required" });
        }
        const shop = await Shop.findOne({ owner: req.userId });
        if (!shop) {
            return res.status(400).json({ message: "Shop not found" });
        }
        const item = await Item.create({ name, desc, category, foodType, price, image, shop: shop._id });

        await shop.populate("owner");
        const items = await Item.find({ shop: shop._id })
            .populate("category", "name")
            .sort({ updatedAt: -1 });

        return res.status(201).json({
            _id: shop._id,
            name: shop.name,
            image: shop.image,
            owner: shop.owner,
            city: shop.city,
            state: shop.state,
            address: shop.address,
            hotline: shop.hotline,
            openTime: shop.openTime,
            closeTime: shop.closeTime,
            status: shop.status,
            createdAt: shop.createdAt,
            updatedAt: shop.updatedAt,
            items: items
        });
    } catch (error) {
        return res.status(500).json({ message: `Add item failed. Error: ${error.message}` });
    }
}

export const editItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const { name, desc, category, foodType, price } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        const item = await Item.findByIdAndUpdate(itemId, { name, desc, category, foodType, price, image }, { new: true });
        if (!item) {
            return res.status(400).json({ message: "Item not found" });
        }
        const shop = await Shop.findOne({ owner: req.userId }).populate("owner");
        const items = await Item.find({ shop: shop._id })
            .populate("category", "name")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            _id: shop._id,
            name: shop.name,
            image: shop.image,
            owner: shop.owner,
            city: shop.city,
            state: shop.state,
            address: shop.address,
            hotline: shop.hotline,
            openTime: shop.openTime,
            closeTime: shop.closeTime,
            status: shop.status,
            createdAt: shop.createdAt,
            updatedAt: shop.updatedAt,
            items: items
        });
    } catch (error) {
        return res.status(500).json({ message: `Edit item failed. Error: ${error.message}` });
    }
}

export const getItemById = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(400).json({ message: "Item not found" });
        }
        return res.status(200).json(item);
    } catch (error) {
        return res.status(500).json({ message: `Get item failed. Error: ${error.message}` });
    }
}

export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(400).json({ message: "Item not found" });
        }
        const shop = await Shop.findById(item.shop);
        if (!shop) {
            return res.status(400).json({ message: "Shop not found" });
        }
        if (shop.owner.toString() !== req.userId) {
            return res.status(403).json({ message: "You are not authorized to delete this item" });
        }
        await Item.findByIdAndDelete(itemId);

        await shop.populate("owner");
        const items = await Item.find({ shop: shop._id })
            .populate("category", "name")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            _id: shop._id,
            name: shop.name,
            image: shop.image,
            owner: shop.owner,
            city: shop.city,
            state: shop.state,
            address: shop.address,
            status: shop.status,
            createdAt: shop.createdAt,
            updatedAt: shop.updatedAt,
            items: items
        });
    } catch (error) {
        return res.status(500).json({ message: `Delete item failed. Error: ${error.message}` });
    }
}

export const getItemByCity = async (req, res) => {
    try {
        const { city } = req.params;
        if (!city) {
            return res.status(400).json({ message: "City is required" });
        }
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        });
        if (!shops) {
            return res.status(404).json({ message: "Shop not found" });
        }
        const shopIds = shops.map((shop) => shop._id);
        const items = await Item.find({ shop: { $in: shopIds } })
            .populate("category", "name")
            .populate("shop", "name image lat lon");
        return res.status(200).json(items);
    } catch (error) {
        return res.status(500).json({ message: `Get items by city failed. Error: ${error.message}` });
    }
}

export const getItemsByShop = async (req, res) => {
    try {
        const { shopId } = req.params;
        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(400).json({ message: "Shop not found" });
        }

        const items = await Item.find({ shop: shopId })
            .populate("category", "name")
            .populate("shop")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            shop,
            items: items
        });
    } catch (error) {
        return res.status(500).json({ message: `Get items by shop failed. Error: ${error.message}` });
    }
}

export const searchItems = async (req, res) => {
    try {
        const { query, city } = req.query;
        if (!query || !city) {
            return null;
        }
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        });
        if (!shops) {
            return res.status(404).json({ message: "Shop not found" });
        }
        const shopIds = shops.map(s => s._id);

        // Search for matching categories first
        const matchingCategories = await Category.find({
            name: { $regex: query, $options: "i" }
        });
        const categoryIds = matchingCategories.map(c => c._id);

        // Build query with both name and category search
        const searchQuery = {
            shop: { $in: shopIds },
            $or: [
                { name: { $regex: query, $options: "i" } }
            ]
        };

        // Add category filter if matching categories found
        if (categoryIds.length > 0) {
            searchQuery.$or.push({ category: { $in: categoryIds } });
        }

        const items = await Item.find(searchQuery)
            .populate("shop", "name image lat lon")
            .populate("category", "name");

        return res.status(200).json(items);
    } catch (error) {
        return res.status(500).json({ message: `Search failed. Error: ${error.message}` })
    }
}