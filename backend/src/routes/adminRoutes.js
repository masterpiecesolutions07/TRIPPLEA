import { Router } from "express";
import {
  analytics,
  auditLogs,
  createMentor,
  getSettings,
  listUsers,
  updateRole,
  updateSettings
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { mentorAccountSchema, roleSchema, settingsSchema } from "../validators/staffValidators.js";

const router = Router();
router.use(protect, authorize("admin"));

router.get("/users", listUsers);
router.patch("/users/:id/role", validate(roleSchema), updateRole);
router.post("/mentors", validate(mentorAccountSchema), createMentor);
router.get("/audit-logs", auditLogs);
router.get("/analytics", analytics);
router.get("/settings", getSettings);
router.patch("/settings", validate(settingsSchema), updateSettings);

export default router;
