import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    shopOrder: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    deliveryPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    shopRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    deliveryRating: {
        type: Number,
        min: 1,
        max: 5
    },
    reviewText: {
        type: String,
        maxlength: 500
    },
    images: [{
        type: String
    }]
}, { timestamps: true });

// Index for faster queries
reviewSchema.index({ shop: 1, createdAt: -1 });
reviewSchema.index({ deliveryPerson: 1, createdAt: -1 });
reviewSchema.index({ user: 1, order: 1 }, { unique: true }); // One review per order per user

const Review = mongoose.model("Review", reviewSchema);
export default Review;
