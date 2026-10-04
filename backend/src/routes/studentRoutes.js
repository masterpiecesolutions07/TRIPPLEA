import { Router } from "express";
import { clearNotifications, home, listMyStories, notifications, removeNotification, sessions, setNotificationRead, submitStory } from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { notificationReadSchema, storySchema } from "../validators/staffValidators.js";

const router = Router();
router.use(protect);

router.get("/home", home);
router.get("/sessions", sessions);
router.get("/notifications", notifications);
router.patch("/notifications/:id", validate(notificationReadSchema), setNotificationRead);
router.delete("/notifications/:id", removeNotification);
router.delete("/notifications", clearNotifications);
router.get("/stories", listMyStories);
router.post("/stories", validate(storySchema), submitStory);

export default router;
