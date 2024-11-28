import dotenv from "dotenv"
import nodemailer from "nodemailer"
import UserModel, { IUser } from "../model/UserModel";

dotenv.config();


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});

export const send_Otp = async (user: IUser): Promise<void> =>{
    
    try {
        // Generate OTP
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        user.otp = otp; // Assign OTP to the user document
        await user.save();
    
        // Send OTP via email
        const mailOptions = {
          from: process.env.AUTH_EMAIL,
          to: user.email,
          subject: "Your OTP Code",
          text: `Hi ${user.username}, your OTP code is: ${otp}`,
        };
    
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent successfully to ${user.email}`);
      } catch (error: any) {
        console.error("Error sending OTP:", error.message);
        throw new Error("Failed to send OTP");
      }
}




