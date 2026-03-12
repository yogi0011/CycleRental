import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { getAllCyclesAdmin, updateCycle, deleteCycleAdmin, getDashboardStats, getAllBookingsAdmin } from "../services/adminService.js";

const checkAdmin = (req: AuthRequest, res: Response) => {
  if (req.user?.role !== "admin") { res.status(403).json({ error: "Admin only" }); return false; }
  return true;
};

export const adminCycles = async (req: AuthRequest, res: Response) => {
  if (!checkAdmin(req, res)) return;
  try { res.json(await getAllCyclesAdmin()); } catch (e: any) { res.status(500).json({ error: e.message }); }
};

export const adminUpdateCycle = async (req: AuthRequest, res: Response) => {
  if (!checkAdmin(req, res)) return;
  try {
    const { model, price, location, available, image } = req.body;
    const cycle = await updateCycle(Number(req.params.id), { model, price: Number(price), location, available, image });
    res.json(cycle);
  } catch (e: any) { res.status(400).json({ error: e.message }); }
};

export const adminDeleteCycle = async (req: AuthRequest, res: Response) => {
  if (!checkAdmin(req, res)) return;
  try { await deleteCycleAdmin(Number(req.params.id)); res.json({ message: "Deleted" }); }
  catch (e: any) { res.status(400).json({ error: e.message }); }
};

export const adminStats = async (req: AuthRequest, res: Response) => {
  if (!checkAdmin(req, res)) return;
  try { res.json(await getDashboardStats()); } catch (e: any) { res.status(500).json({ error: e.message }); }
};

export const adminBookings = async (req: AuthRequest, res: Response) => {
  if (!checkAdmin(req, res)) return;
  try { res.json(await getAllBookingsAdmin()); } catch (e: any) { res.status(500).json({ error: e.message }); }
};
