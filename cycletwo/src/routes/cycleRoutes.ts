import express from "express";
import { addCycle, getCycles, getCycle, removeCycle } from "../controllers/cycleController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCycles);
router.get("/:id", getCycle);
router.post("/", authenticate, addCycle);
router.delete("/:id", authenticate, removeCycle);

export default router;