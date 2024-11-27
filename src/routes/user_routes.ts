import express from "express";
import { signup, login } from "../controllers/user_controller"; // Adjust the path as needed

const router = express.Router();

router.post("/signup", signup as any);
router.post("/login", login as any);

export default router;
