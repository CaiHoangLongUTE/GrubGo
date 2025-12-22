import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpEmail } from "../utils/mail.js";

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Người dùng không tồn tại" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu không chính xác" });
        }

        const token = await genToken(user._id);
        res.cookie("token", token, {
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Đăng nhập thất bại. Lỗi: ${error.message}` });
    }
};

export const signUp = async (req, res) => {
    try {
        const { fullName, email, password, mobile, role } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Người dùng đã tồn tại" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
        }
        if (mobile.length < 10) {
            return res.status(400).json({ message: "Số điện thoại phải có ít nhất 10 số" });
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
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Đăng ký thất bại. Lỗi: ${error.message}` });
    }
};

export const signOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            secure: true,
            sameSite: "none",
            httpOnly: true
        });
        return res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
        return res.status(500).json({ message: `Đăng xuất thất bại. Lỗi: ${error.message}` });
    }
};

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Người dùng không tồn tại" });
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetOtp = otp;
        user.otpExpiresAt = Date.now() + 30 * 60 * 1000;
        user.isOtpVerified = false;
        await user.save();
        await sendOtpEmail({ to: email, otp });
        return res.status(200).json({ message: "Mã OTP đã được gửi đến email của bạn" });
    } catch (error) {
        return res.status(500).json({ message: `Gửi mã OTP thất bại. Lỗi: ${error.message}` });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        // Kiểm tra OTP và hạn dùng
        if (user.resetOtp !== otp) {
            return res.status(400).json({ message: "Mã OTP không hợp lệ" });
        }
        if (user.otpExpiresAt < Date.now()) {
            return res.status(400).json({ message: "Mã OTP đã hết hạn" });
        }
        user.isOtpVerified = true;
        user.resetOtp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();
        return res.status(200).json({ message: "Xác thực OTP thành công" });
    } catch (error) {
        return res.status(500).json({ message: `Xác thực OTP thất bại. Lỗi: ${error.message}` });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.isOtpVerified) {
            return res.status(400).json({ message: "OTP chưa được xác thực" });
        }
        const hanhedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hanhedPassword;
        user.isOtpVerified = false;
        await user.save();
        return res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
    } catch (error) {
        return res.status(500).json({ message: `Đặt lại mật khẩu thất bại. Lỗi: ${error.message}` });
    }
}

export const googleAuth = async (req, res) => {
    try {
        const { fullName, email, mobile, role } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ fullName, email, mobile, role });
        }
        const token = await genToken(user._id);
        res.cookie("token", token, {
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true
        });
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Đăng nhập bằng Google thất bại. Lỗi: ${error.message}` });
    }
}

