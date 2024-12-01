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
  recoveryToken: String;
  otpExpiry:Date | null;
  rtExpiry:Date | null;
}

const UserSchema = new Schema<IUser>(
  {
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry:{
      type: Date,
      default: null
    },
    recoveryToken : {
      type: String,
    },
    rtExpiry:{
      type:Date,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;