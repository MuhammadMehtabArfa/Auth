import { Request, response, Response } from "express";
import UserModel, { IUser } from "../model/UserModel";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";


// Signup
export const signup = async (req: Request, res: Response): Promise<void> => {
    try {

        const { username, email, password } = req.body

        const existing_user = await UserModel.findOne({ email });

        if (existing_user) {
            res.status(400).json({ message: "USER ALREADY EXISTS" });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser: IUser = new UserModel({
            username,
            email,
            password: hashedPassword,
        })
        await newUser.save();

        res.status(201).json({ message: "User created successfully" });
        return
    } catch (error: any) {

        res.status(500).json({ message: "Server error", error: error.message });
        return
    }
};




// Login
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body
        const user = await UserModel.findOne({ email })

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid credentials" });
            return
        }

        const token = jwt.sign(


            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({ message: "Login successful", token });
        return
    } catch (error) {
        const err = error as any
        res.status(500).json({ message: "Server error", error: err.message });
        return
    }
};





// Email Verification



