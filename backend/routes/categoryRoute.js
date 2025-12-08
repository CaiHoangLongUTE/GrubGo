import express from "express";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/isAdmin.js";
import { upload } from "../middlewares/multer.js";
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/categoryController.js";

const categoryRouter = express.Router();

categoryRouter.get("/all", getAllCategories);
categoryRouter.get("/:id", getCategoryById);
categoryRouter.post("/create", isAuth, isAdmin, upload.single("image"), createCategory);
categoryRouter.put("/update/:id", isAuth, isAdmin, upload.single("image"), updateCategory);
categoryRouter.delete("/delete/:id", isAuth, isAdmin, deleteCategory);

export default categoryRouter;
