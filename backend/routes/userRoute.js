import express from "express";
import { getCurrentUser, updateUserLocation, updateProfile } from "../controllers/userController.js";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/update-location", isAuth, updateUserLocation);
userRouter.put("/update-profile", isAuth, upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'citizenIdentityFront', maxCount: 1 },
    { name: 'citizenIdentityBack', maxCount: 1 },
    { name: 'driverLicenseFront', maxCount: 1 },
    { name: 'driverLicenseBack', maxCount: 1 }
]), updateProfile);

export default userRouter;
