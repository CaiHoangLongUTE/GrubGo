import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    city: { type: String, required: true }, // Tỉnh/Thành phố
    district: { type: String, required: true }, // Quận/Huyện
    commune: { type: String, required: true }, // Xã/Phường
    address: { type: String, required: true },
    lat: { type: Number, default: 0 },
    lon: { type: Number, default: 0 },
    hotline: { type: String },
    openTime: { type: String },
    closeTime: { type: String },
    businessLicense: { type: String, required: true },
    foodSafetyLicense: { type: String, required: true },
    firePreventionLicense: { type: String, required: true },
    status: { type: String, enum: ["active", "pending", "disabled", "rejected"], default: "pending" },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
}, { timestamps: true });

const Shop = mongoose.model("Shop", shopSchema);
export default Shop;