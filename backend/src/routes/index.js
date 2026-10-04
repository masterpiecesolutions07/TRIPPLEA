import { Router } from "express";
import adminRoutes from "./adminRoutes.js";
import authRoutes from "./authRoutes.js";
import courseRoutes from "./courseRoutes.js";
import messageRoutes from "./messageRoutes.js";
import publicRoutes from "./publicRoutes.js";
import staffRoutes from "./staffRoutes.js";
import studentRoutes from "./studentRoutes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true });
});
router.use("/auth", authRoutes);
router.use("/course", courseRoutes);
router.use("/public", publicRoutes);
router.use("/messages", messageRoutes);
router.use("/staff", staffRoutes);
router.use("/admin", adminRoutes);
router.use("/student", studentRoutes);

export default router;
