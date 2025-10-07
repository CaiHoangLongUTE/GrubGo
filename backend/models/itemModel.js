import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    category: { type: String, enum: ["Snacks", "Pizza", "Burgers", "Sanwich"], required: true },
    price: { type: Number, min: 0, required: true },
    foodType: { type: String, enum: ["veg", "non-veg"], required: true },

}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);
export default Item