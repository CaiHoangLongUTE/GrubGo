import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    desc: { type: String },
    image: { type: String, required: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, min: 0, required: true },
    foodType: { type: String, enum: ["food", "drink"], required: true },
}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);
export default Item;