import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { adminCycles, adminUpdateCycle, adminDeleteCycle, adminStats, adminBookings } from "../controllers/adminController.js";

const router = Router();
router.get("/cycles", authenticate, adminCycles);
router.put("/cycles/:id", authenticate, adminUpdateCycle);
router.delete("/cycles/:id", authenticate, adminDeleteCycle);
router.get("/stats", authenticate, adminStats);
router.get("/bookings", authenticate, adminBookings);
export default router;
