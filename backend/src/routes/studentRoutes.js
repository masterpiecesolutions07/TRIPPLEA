import { Router } from "express";
import { home, notifications, sessions, submitStory } from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { storySchema } from "../validators/staffValidators.js";

const router = Router();
router.use(protect);

router.get("/home", home);
router.get("/sessions", sessions);
router.get("/notifications", notifications);
router.post("/stories", validate(storySchema), submitStory);

export default router;
