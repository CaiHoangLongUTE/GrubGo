import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    mobile: { type: String, required: true },
    role: { type: String, enum: ["user", "owner", "delivery", "admin"], required: true },
    avatar: { type: String },
    gender: { type: Number, default: 1 },
    birthDay: { type: Date },

    resetOtp: { type: String },
    isOtpVerified: { type: Boolean, default: false },
    otpExpiresAt: { type: Date },

    //for delivery person and owner
    citizenIdentityFront: { type: String },
    citizenIdentityBack: { type: String },
    //for delivery person
    driverLicenseFront: { type: String },
    driverLicenseBack: { type: String },
    typeOfVehicle: { type: String },
    licensePlate: { type: String },
    location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] }
    },
    socketId: { type: String },
    isOnline: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "banned", "pending", "rejected"], default: "active" },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    }
}, { timestamps: true });

userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
export default User;