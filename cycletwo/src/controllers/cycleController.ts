import { Response } from "express";
import { createCycle, getAllCycles, getCycleById, deleteCycle } from "../services/cycleService.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

export const addCycle = async (req: AuthRequest, res: Response) => {
  try {
    const { model, price, location, image } = req.body;
    const shopkeeperId = req.user?.id;

    if (!model || !price || !location)
      return res.status(400).json({ error: "Model, price and location are required" });

    if (!shopkeeperId)
      return res.status(401).json({ error: "Not authenticated" });

    const cycle = await createCycle({ model, price: Number(price), location, image: image || null, shopkeeperId });
    res.status(201).json(cycle);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getCycles = async (req: AuthRequest, res: Response) => {
  try {
    const cycles = await getAllCycles();
    res.json(cycles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCycle = async (req: AuthRequest, res: Response) => {
  try {
    const cycle = await getCycleById(Number(req.params.id));
    if (!cycle) return res.status(404).json({ error: "Cycle not found" });
    res.json(cycle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const removeCycle = async (req: AuthRequest, res: Response) => {
  try {
    await deleteCycle(Number(req.params.id));
    res.json({ message: "Cycle deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
