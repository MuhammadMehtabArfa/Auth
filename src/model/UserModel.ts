import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  username: string;
  otp: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  isVerified: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;