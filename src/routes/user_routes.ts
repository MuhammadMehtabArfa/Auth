import express from "express";
import { signup, login } from "../controllers/user_controller";
import { check } from "express-validator";

const router = express.Router();

router.post("/signup", [
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

export default router;
