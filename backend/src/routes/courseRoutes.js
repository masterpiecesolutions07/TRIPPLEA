import { Router } from "express";
import { completeLesson, getCourseGate, getLesson, saveLessonNotes } from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireActiveEnrollment } from "../middleware/courseAccess.js";
import { validate } from "../middleware/validateMiddleware.js";
import { lessonNotesSchema } from "../validators/courseValidators.js";

const router = Router();

router.get("/", protect, getCourseGate);
router.get("/lessons/:id", protect, requireActiveEnrollment, getLesson);
router.post("/lessons/:id/complete", protect, requireActiveEnrollment, completeLesson);
router.patch("/lessons/:id/notes", protect, validate(lessonNotesSchema), saveLessonNotes);

export default router;
