import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { rateCycle, rateShopkeeper, getCycleRatings } from "../services/ratingService.js";

export const addCycleRating = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, cycleId, rating, comment } = req.body;
    const r = await rateCycle(req.user.id, bookingId, cycleId, rating, comment);
    res.status(201).json(r);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
};

export const addShopkeeperRating = async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId, shopkeeperId, rating, comment } = req.body;
    const r = await rateShopkeeper(req.user.id, bookingId, shopkeeperId, rating, comment);
    res.status(201).json(r);
  } catch (err: any) { res.status(400).json({ error: err.message }); }
};

export const cycleRatings = async (req: AuthRequest, res: Response) => {
  try {
    const r = await getCycleRatings(Number(req.params.id));
    res.json(r);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};
