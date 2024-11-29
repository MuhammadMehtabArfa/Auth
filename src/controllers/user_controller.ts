import { Request, response, Response } from "express";
import UserModel, { IUser } from "../model/UserModel";
import bcrypt from "bcryptjs";
import { generateToken } from "../utility/generateToken";
import { validationResult } from "express-validator";
import { send_Otp } from "../utility/mailer";

// Signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);


  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array().map(error => error.msg).join(", ") });
    return
  }
  try {
    const { username, email, password } = req.body;

    // Hash password and create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: IUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    newUser.otp = otp; // Assign OTP to the user document
    await newUser.save();
    const message = `Hi ${newUser.username}, your OTP code is: ${otp}`
    const subject = "Your OTP Code"





    await send_Otp(newUser.email, message, subject)
    res.status(201).json({ message: "otp sent successfully" })
    return
  } catch (error: any) {
    console.log(error);
    if (error?.code === 11000) {
      const field = error?.message.includes("email") ? "email" : "username";
      res.status(401).json({
        message: `${field.charAt(0).toUpperCase() + field.slice(1)
          } must be unique`,
      });
      return;
    }

    // res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);


  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array().map(error => error.msg).join(", ") });
    return
  }

  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return
    }
    if (!user.isVerified) {
      const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
      user.otp = otp; // Assign OTP to the user document
      await user.save();
      const message = `Hi ${user.username}, your OTP code is: ${otp}`
      const subject = "Your OTP Code"

      await send_Otp(user.email, message, subject)
      res.status(201).json({ message: "otp sent successfully" })
      return
    }

    const access_token = generateToken(user?._id, user?.email);

    res.status(200).json({ message: "Login successful", access_token });
    return
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Server error", error: error?.message });
    return
  }
};

// verify otp
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);


  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array().map(error => error.msg).join(", ") });
    return
  }
  const { otp, email } = req.body;

  try {
    const user = await UserModel.findOne({ email });


    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (otp === user.otp) {
      user.isVerified = true;
      user.otp = "";
      await user.save();
      res.status(200).json({ message: "otp is verified successfully" })

    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });

  }

}


// Forgot password function
export const forgotpass = async (req: Request, res: Response): Promise<void> => {



}
