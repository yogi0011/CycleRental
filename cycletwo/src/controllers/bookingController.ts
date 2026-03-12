import { Response } from "express";
import { createBooking, getUserBookings, cancelBooking, markDelivered, completeBooking, getShopkeeperBookings } from "../services/bookingService.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const bookCycle = async (req: AuthRequest, res: Response) => {
  try {
    const { cycleId, startTime, endTime } = req.body;
    const booking = await createBooking(req.user.id, cycleId, startTime, endTime);
    res.status(201).json(booking);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
};

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try { res.json(await getUserBookings(req.user.id)); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getShopBookings = async (req: AuthRequest, res: Response) => {
  try { res.json(await getShopkeeperBookings(req.user.id)); }
  catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const cancelMyBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await cancelBooking(Number(req.params.id), req.user.id);
    res.json({ message: "Booking cancelled", booking });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
};

export const deliverCycle = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await markDelivered(Number(req.params.id), req.user.id);
    res.json({ message: "Marked as delivered", booking });
  } catch (err: any) { res.status(400).json({ error: err.message }); }
};

export const completeMyBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await completeBooking(Number(req.params.id));
    res.json({ message: "Booking completed", booking });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};
