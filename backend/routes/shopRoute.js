import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createEditShop, getMyShop, getShopByCity, getShopStats } from "../controllers/shopController.js";
import { upload } from "../middlewares/multer.js";

const shopRouter = express.Router();

shopRouter.post("/create-edit", isAuth, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'businessLicense', maxCount: 1 },
    { name: 'foodSafetyLicense', maxCount: 1 },
    { name: 'firePreventionLicense', maxCount: 1 }
]), createEditShop);
shopRouter.get("/get-my", isAuth, getMyShop);
shopRouter.get("/get-by-city/:city", isAuth, getShopByCity);
shopRouter.get("/stats", isAuth, getShopStats);


export default shopRouter;
