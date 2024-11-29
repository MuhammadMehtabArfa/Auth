import dotenv from "dotenv"
import nodemailer from "nodemailer"
import  { IUser } from "../model/UserModel";

dotenv.config();


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});

export const send_Otp = async (email: string, message:string, subject:string): Promise<void> =>{
    
    try {
        // Generate OTP
        
    
        // Send OTP via email
        const mailOptions = {
          from: process.env.AUTH_EMAIL,
          to: email,
          subject: subject,
          text: message,
        };
    
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent successfully to ${email}`);
      } catch (error: any) {
        console.error("Error sending OTP:", error.message);
        throw new Error("Failed to send OTP");
      }
}




