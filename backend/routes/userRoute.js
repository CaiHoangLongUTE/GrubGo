import express from "express";
import { getCurrentUser, updateUserLocation, updateProfile, uploadAvatar } from "../controllers/userController.js";
import isAuth from "../middlewares/isAuth.js";
import {upload} from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post("/update-location", isAuth, updateUserLocation);
userRouter.put("/update-profile", isAuth, updateProfile);
userRouter.post("/upload-avatar", isAuth, upload.single('image'), uploadAvatar);

export default userRouter;
