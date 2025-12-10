import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
    addAddress,
    deleteAddress,
    getAllAddresses,
    setDefaultAddress,
    updateAddress
} from "../controllers/addressController.js";

const router = express.Router();

router.post("/add", isAuth, addAddress);
router.get("/get-all", isAuth, getAllAddresses);
router.put("/update/:id", isAuth, updateAddress);
router.delete("/delete/:id", isAuth, deleteAddress);
router.put("/set-default/:id", isAuth, setDefaultAddress);

export default router;
