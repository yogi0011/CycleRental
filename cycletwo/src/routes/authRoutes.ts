import { Router } from "express";
import { register, login, forgotPassword, doResetPassword } from "../controllers/authController.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", doResetPassword);
export default router;
