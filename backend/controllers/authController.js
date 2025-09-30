import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpEmail } from "../utils/mail.js";

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exists" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        const token = await genToken(user._id);
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json(`Sign in failed. Error: ${error.message}`);
    }
};

export const signUp = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        if (mobile.length < 10) {
            return res.status(400).json({ message: "Mobile number must be at least 10 characters" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            mobile,
            role
        });

        const token = await genToken(user._id);
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json(`Sign up failed. Error: ${error.message}`);
    }
};

export const signOut = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "Log out successfully" });
    } catch (error) {
        return res.status(500).json(`Sign out failed. Error: ${error.message}`);
    }
};

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exists" });
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetOtp = otp;
        user.otpExpiresAt = Date.now() + 30 * 60 * 1000;
        user.isOtpVerified = false;
        await user.save();
        await sendOtpEmail({ to: email, otp });
        return res.status(200).json({ message: "OTP sent to email successfully" });
    } catch (error) {
        return res.status(500).json(`Sending OTP failed. Error: ${error.message}`);
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Kiểm tra OTP và hạn dùng
        if (user.resetOtp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }
        if (user.otpExpiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }
        user.isOtpVerified = true;
        user.resetOtp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();
        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        return res.status(500).json(`Verifying OTP failed. Error: ${error.message}`);
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "OTP not verified" });
        }
        const hanhedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hanhedPassword;
        user.isOtpVerified = false;
        await user.save();
        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        return res.status(500).json(`Resetting password failed. Error: ${error.message}`);
    }
}

export const googleAuth = async (req, res) => {
    try {
        const {fullName, email, mobile, role} = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({fullName, email, mobile, role});
        }
        const token = await genToken(user._id);
        res.cookie("token", token, {
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json(`Google authentication failed. Error: ${error.message}`);
    }
}

