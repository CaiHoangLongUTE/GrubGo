import express from "express";
import isAuth from "../middlewares/isAuth";
import { createEditShop } from "../controllers/shopController.js";
import { upload } from "../middlewares/multer.js";

const shopRouter = express.Router();

shopRouter.get("/create-edit", isAuth, upload.single("image"), createEditShop);

export default shopRouter;
    