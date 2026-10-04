import { Router } from "express";
import { changePassword, login, logout, me, refresh, register, updateAvatar } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validateMiddleware.js";
import { changePasswordSchema, loginSchema, registerSchema } from "../validators/authValidators.js";
import { avatarSchema } from "../validators/staffValidators.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", protect, me);
router.patch("/profile", protect, validate(avatarSchema), updateAvatar);
router.post("/change-password", protect, validate(changePasswordSchema), changePassword);
router.get("/mentor-check", protect, authorize("mentor", "admin"), (_req, res) => {
  res.json({ ok: true });
});

export default router;
