import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export const sendOtpEmail = async ({to, otp}) => {
    await transporter.sendMail({
        from: `"GrubGo Support" <${process.env.EMAIL}>`,
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
            <p>Mã có hiệu lực trong <b>30 phút</b>.</p>
          </div>
        </body>
        </html>
      `
    })
}

export const sendDeliveryOtpEmail = async ({user, otp}) => {
    await transporter.sendMail({
        from: `"GrubGo Support" <${process.env.EMAIL}>`,
        to: user.email,
        subject: "[GrubGo] Delivery OTP",
        html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body>
          <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2 style="color:#ff4d2d;">🔑 OTP delivery</h2>
            <p>Mã OTP của bạn là:</p>
            <h1 style="color:#ff4d2d;">${otp}</h1>
            <p>Mã có hiệu lực trong <b>10 phút</b>.</p>
          </div>
        </body>
        </html> 
      `
    })
}