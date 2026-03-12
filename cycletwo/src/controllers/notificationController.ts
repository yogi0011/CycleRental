import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { getAll, markAllRead } from "../services/notificationService.js";

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const { role, id } = req.user;
    const notifs = await getAll(
      role === "user" ? id : undefined,
      role === "shopkeeper" ? id : undefined,
      role === "admin" ? id : undefined
    );
    res.json(notifs);
  } catch (e: any) { res.status(500).json({ error: e.message }); }
};

export const readAll = async (req: AuthRequest, res: Response) => {
  try {
    const { role, id } = req.user;
    await markAllRead(
      role === "user" ? id : undefined,
      role === "shopkeeper" ? id : undefined,
      role === "admin" ? id : undefined
    );
    res.json({ ok: true });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
};
