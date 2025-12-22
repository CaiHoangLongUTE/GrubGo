import Category from "../models/categoryModel.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({ message: `Lấy danh sách danh mục thất bại. Lỗi: ${error.message}` });
    }
}

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }
        return res.status(200).json(category);
    } catch (error) {
        return res.status(500).json({ message: `Lấy thông tin danh mục thất bại. Lỗi: ${error.message}` });
    }
}

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: "Danh mục đã tồn tại" });
        }

        // Upload image to Cloudinary
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        } else {
            return res.status(400).json({ message: "Hình ảnh là bắt buộc" });
        }

        const category = await Category.create({ name, image });
        return res.status(201).json(category);
    } catch (error) {
        return res.status(500).json({ message: `Tạo danh mục thất bại. Lỗi: ${error.message}` });
    }
}

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }

        // Update image if new file uploaded
        let image = category.image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name, image },
            { new: true }
        );

        return res.status(200).json(updatedCategory);
    } catch (error) {
        return res.status(500).json({ message: `Cập nhật danh mục thất bại. Lỗi: ${error.message}` });
    }
}

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({ message: "Không tìm thấy danh mục" });
        }

        return res.status(200).json({ message: "Xóa danh mục thành công" });
    } catch (error) {
        return res.status(500).json({ message: `Xóa danh mục thất bại. Lỗi: ${error.message}` });
    }
}
