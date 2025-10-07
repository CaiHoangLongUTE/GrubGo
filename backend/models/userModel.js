import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String},
    mobile: {type: String, required: true},
    role : {type: String, enum: ["user", "owner", "delivery", "admin"], required: true},
    resetOtp: {type: String},
    isOtpVerified: {type: Boolean, default: false},
    otpExpiresAt: {type: Date},
},{timestamps: true});

const User = mongoose.model("User", userSchema);
export default User;    