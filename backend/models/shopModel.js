import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    address: { type: String, required: true },
    hotline: { type: String },
    openTime: { type: String },
    closeTime: { type: String },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
}, { timestamps: true });

const Shop = mongoose.model("Shop", shopSchema);
export default Shop;