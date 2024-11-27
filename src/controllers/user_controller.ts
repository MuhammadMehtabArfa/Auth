import { Request, response, Response } from "express";
import UserModel, { IUser } from "../model/UserModel";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateToken } from "../utility/generateToken";

// Signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Hash password and create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: IUser = new UserModel({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
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
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user: IUser | null = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const access_token = generateToken(user?._id, user?.email);

    return res.status(200).json({ message: "Login successful", access_token });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Server error", error: error?.message });
  }
};

// Email Verification
