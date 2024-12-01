import { Request, Response } from "express";
import UserModel, { IUser } from "../model/UserModel";
import bcrypt from "bcryptjs";
import { generateToken } from "../utility/generateToken";
import { validationResult } from "express-validator";
import { send_Otp } from "../utility/mailer";
import crypto from "crypto";

// Signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: errors
        .array()
        .map((error) => error.msg)
        .join(", "),
    });
    return;
  }
  try {
    const { username, email, password } = req.body;

    // Hash password and create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user: IUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const otpExpiry = new Date();
    otpExpiry.setDate(otpExpiry.getDate() + 1);
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    const message = `Hi ${user.username}, your OTP code is: ${otp}`;
    const subject = "Your OTP Code";

    await send_Otp(user.email, message, subject);
    res.status(201).json({ message: "otp sent successfully" });
    return;
  } catch (error: any) {
    console.log(error);
    if (error?.code === 11000) {
      const field = error?.message.includes("email") ? "email" : "username";
      res.status(401).json({
        message: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } must be unique`,
      });
      return;
    }

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: errors
        .array()
        .map((error) => error.msg)
        .join(", "),
    });
    return;
  }

  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    if (!user.isVerified) {
      const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
      const otpExpiry = new Date();
      otpExpiry.setDate(otpExpiry.getDate() + 1);
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
      const message = `Hi ${user.username}, your OTP code is: ${otp}`;
      const subject = "Your OTP Code";

      await send_Otp(user.email, message, subject);
      res.status(201).json({ message: "otp sent successfully" });
      return;
    }

    const access_token = generateToken(user?._id, user?.email);

    res.status(200).json({ message: "Login successful", user, access_token });
    return;
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error?.message });
    return;
  }
};

// verify otp
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: errors
        .array()
        .map((error) => error.msg)
        .join(", "),
    });
    return;
  }
  const { otp, email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.otp || !user.otpExpiry) {
      res.status(400).json({ message: "OTP not set or expired" });
      return;
    }

    const currentTime = new Date();
    const otpExpiry = new Date(user.otpExpiry);

    if (currentTime > otpExpiry) {
      res.status(400).json({ message: "OTP has expired" });
      return;
    }

    if (otp === user.otp) {
      user.isVerified = true;
      user.otp = "";
      user.otpExpiry = null;
      await user.save();
      const access_token = generateToken(user?._id, user?.email);
      res
        .status(200)
        .json({ message: "otp is verified successfully", user, access_token });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Forgot password function
export const forgotpass = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: errors
        .array()
        .map((error) => error.msg)
        .join(", "),
    });
    return;
  }
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const token = crypto.randomBytes(20).toString("hex");
    user.recoveryToken = token;
    user.rtExpiry = new Date(Date.now() + 3600000);
    await user.save();
    const message = `Hi ${user.username}, your recovery token is: ${token}`;
    const subject = "Account Recovery";

    await send_Otp(user.email, message, subject);
    res.status(201).json({ message: "recovery link sent successfully" });
    return;
  } catch (error) {
    console.error("Error during token generation:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

// password reset function
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: errors
        .array()
        .map((error) => error.msg)
        .join(", "),
    });
    return;
  }
  const { rToken, password } = req.body;

  try {
    const user = await UserModel.findOne({ recoveryToken: rToken });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (!user.recoveryToken || user.recoveryToken !== rToken) {
      res.status(400).json({ message: "Invalid recovery token" });
      return;
    }
    if (user.rtExpiry && user.rtExpiry <= new Date()) {
      res.status(400).json({ message: "Recovery token has expired" });
      return;
    }

    const nPassword = await bcrypt.hash(password, 10);
    user.password = nPassword;
    user.recoveryToken = "";
    user.rtExpiry = null;
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
