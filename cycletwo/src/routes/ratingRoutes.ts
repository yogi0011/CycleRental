import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { addCycleRating, addShopkeeperRating, cycleRatings } from "../controllers/ratingController.js";

const router = Router();
router.post("/cycle", authenticate, addCycleRating);
router.post("/shopkeeper", authenticate, addShopkeeperRating);
router.get("/cycle/:id", cycleRatings);
export default router;
