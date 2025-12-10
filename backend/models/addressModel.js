import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tag: { type: String, required: true }, // e.g., "Nhà riêng", "Văn phòng"
    city: { type: String, required: true },
    state: { type: String, required: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    isDefault: { type: Boolean, default: false }
}, { timestamps: true });

const Address = mongoose.model("Address", addressSchema);
export default Address;
