import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export const sendOtpEmail = async ({to, otp}) => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject: "[GrubGo] Your OTP Code",
        html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body>
                <div style="font-family: Arial, sans-serif; text-align: center;">
                <h2 style="color:#ff4d2d;">🔑 Reset Password OTP</h2>
                <p>Mã OTP của bạn là:</p>
                <h1 style="color:#ff4d2d;">${otp}</h1>
                <p>Mã có hiệu lực trong 5 phút.</p>
                </div>
            </body>
            </html>
        `
    })
}