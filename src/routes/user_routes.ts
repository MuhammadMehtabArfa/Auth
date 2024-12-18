import express from "express";
import { signup, login, verifyOtp, forgotpass, resetPassword } from "../controllers/user_controller";
import { check } from "express-validator";

const router = express.Router();

router.post("/sign-up", [
    check("username").notEmpty().withMessage("Username is required"),
    check("email").isEmail().withMessage("A valid email is required"),
    check("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
], signup);

router.post("/login", [
    check("email").isEmail().withMessage("A valid email is required"),
    check("password").notEmpty().withMessage("Password is required"),
], login);

router.post("/verify-otp", [
    check("email").isEmail().withMessage("A valid email is required"),
    check("otp").notEmpty().withMessage("otp is required").isLength({ min: 4, max: 4 }),


], verifyOtp);
router.post("/forgot-password", [
    check("email").isEmail().withMessage("A valid email is required"),

], forgotpass);

router.post("/reset-password", [
    check("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),

], resetPassword)


export default router;
