import { Request, Response } from "express";
import { registerUser, loginUser, requestPasswordReset, resetPassword } from "../services/authService.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, location, phone, address } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ error: "All fields are required" });
    const user = await registerUser({ name, email, password, role, location, phone, address });
    res.status(201).json({ message: "Registered successfully", user });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ error: "All fields are required" });
    const user = await loginUser({ email, password, role });
    res.json({
      message: "Login successful",
      token: user.token,
      user: {
        id: user.id, name: user.name, email: user.email, role: user.role,
        location: user.location || null, phone: user.phone || null, address: user.address || null,
      },
    });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ error: "Email and role required" });
    const token = await requestPasswordReset(email, role);
    res.json({ message: "Reset token generated", token });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
};

export const doResetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword, role } = req.body;
    if (!token || !newPassword || !role) return res.status(400).json({ error: "All fields required" });
    await resetPassword(token, newPassword, role);
    res.json({ message: "Password reset successfully" });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
};
