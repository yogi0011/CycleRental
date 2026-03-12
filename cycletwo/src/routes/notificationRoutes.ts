import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getNotifications, readAll } from "../controllers/notificationController.js";

const router = Router();
router.get("/", authenticate, getNotifications);
router.post("/read-all", authenticate, readAll);
export default router;
