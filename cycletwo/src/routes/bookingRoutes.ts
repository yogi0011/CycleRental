import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { bookCycle, getMyBookings, cancelMyBooking, deliverCycle, completeMyBooking, getShopBookings } from "../controllers/bookingController.js";

const router = Router();
router.post("/", authenticate, bookCycle);
router.get("/my", authenticate, getMyBookings);
router.get("/shop", authenticate, getShopBookings);
router.patch("/cancel/:id", authenticate, cancelMyBooking);
router.patch("/deliver/:id", authenticate, deliverCycle);
router.patch("/complete/:id", authenticate, completeMyBooking);
export default router;
