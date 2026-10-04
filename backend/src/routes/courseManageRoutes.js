import { Router } from "express";
import {
  createLesson,
  createModule,
  createPhase,
  deleteLesson,
  deleteModule,
  deletePhase,
  duplicateLesson,
  duplicateModule,
  duplicatePhase,
  getManagedCourse,
  reorderCourse,
  updateCourse,
  updateLesson,
  updateModule,
  updatePhase,
  uploadCourseFile
} from "../controllers/courseManageController.js";
import { validate } from "../middleware/validateMiddleware.js";
import { imageSchema } from "../validators/staffValidators.js";
import {
  courseSettingsSchema,
  lessonSchema,
  lessonUpdateSchema,
  moduleSchema,
  moduleUpdateSchema,
  phaseSchema,
  reorderSchema
} from "../validators/courseValidators.js";

const router = Router();

router.get("/", getManagedCourse);
router.patch("/", validate(courseSettingsSchema), updateCourse);
router.post("/files", validate(imageSchema), uploadCourseFile);
router.post("/reorder", validate(reorderSchema), reorderCourse);

router.post("/phases", validate(phaseSchema), createPhase);
router.patch("/phases/:id", validate(phaseSchema), updatePhase);
router.post("/phases/:id/duplicate", duplicatePhase);
router.delete("/phases/:id", deletePhase);

router.post("/modules", validate(moduleSchema), createModule);
router.patch("/modules/:id", validate(moduleUpdateSchema), updateModule);
router.post("/modules/:id/duplicate", duplicateModule);
router.delete("/modules/:id", deleteModule);

router.post("/lessons", validate(lessonSchema), createLesson);
router.patch("/lessons/:id", validate(lessonUpdateSchema), updateLesson);
router.post("/lessons/:id/duplicate", duplicateLesson);
router.delete("/lessons/:id", deleteLesson);

export default router;
