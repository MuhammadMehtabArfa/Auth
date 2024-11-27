import { Request, response, Response } from "express";
import UserModel,{IUser} from "../model/UserModel";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"



// Signup
export const signup = async (req: Request, res: Response): Promise<Response> => {
  try {
    
const { username, email, password } = req.body

  const existing_user = await UserModel.findOne({ email });

  if(existing_user){
    return res.status(400).json({message: "USER ALREADY EXISTS"})
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser : IUser= new UserModel({
    username,
    email,
    password: hashedPassword,
  })
    await newUser.save();

  return res.status(201).json({ message: "User created successfully" });
} catch (error) {
  return res.status(500).json({ message: "Server error", error: error.message });
}
};




// Login
export const login = async (req: Request, res: Response): Promise<Response> => {
try {
    const {email, password}= req.body
    const user = await UserModel.findOne({email})

    if (!user){
        return res.status(404).json({ message: "User not found" });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  
   const token = jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" } 
  );

  return res.status(200).json({ message: "Login successful", token });
} catch (error) {
  return res.status(500).json({ message: "Server error", error.message });
}
};





// Email Verification



