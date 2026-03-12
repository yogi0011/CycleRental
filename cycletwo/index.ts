import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { initSocket } from "./src/utils/socket.js";
import authRoutes from "./src/routes/authRoutes.js";
import cycleRoutes from "./src/routes/cycleRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import ratingRoutes from "./src/routes/ratingRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

initSocket(httpServer);

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", process.env.FRONTEND_URL || ""],
  credentials: true,
}));
app.use(express.json());

app.get("/health", (_, res) => res.json({ status: "ok" }));
app.use("/auth", authRoutes);
app.use("/cycles", cycleRoutes);
app.use("/bookings", bookingRoutes);
app.use("/ratings", ratingRoutes);
app.use("/admin", adminRoutes);
app.use("/notifications", notificationRoutes);

httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
