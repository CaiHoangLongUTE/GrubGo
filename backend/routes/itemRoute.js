import express from "express";
import isAuth from "../middlewares/isAuth";
import { addItem, editItem } from "../controllers/itemController.js";
import { upload } from "../middlewares/multer.js";

const itemRoute = express.Router();

itemRoute.post("/add-item", isAuth, upload.single("image"), addItem);
itemRoute.post("/edit-item/:itemId", isAuth, upload.single("image"), editItem);

export default itemRoute;
