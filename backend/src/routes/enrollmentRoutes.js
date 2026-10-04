import { Router } from "express";
import {
  extendCohortAccess,
  getEnrollment,
  listEnrollments,
  openEnrollment,
  removeEnrollment,
  updateEnrollmentAccess,
  updateEnrollmentStatus,
  updateEnrollments
} from "../controllers/enrollmentController.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  bulkEnrollmentSchema,
  cohortAccessSchema,
  enrollmentAccessSchema,
  enrollmentStatusSchema,
  openEnrollmentSchema
} from "../validators/enrollmentValidators.js";

const router = Router();

router.get("/", listEnrollments);
router.post("/open", validate(openEnrollmentSchema), openEnrollment);
router.post("/bulk", validate(bulkEnrollmentSchema), updateEnrollments);
router.post("/cohort-access", validate(cohortAccessSchema), extendCohortAccess);
router.get("/:id", getEnrollment);
router.patch("/:id/status", validate(enrollmentStatusSchema), updateEnrollmentStatus);
router.patch("/:id/access", validate(enrollmentAccessSchema), updateEnrollmentAccess);
router.delete("/:id", removeEnrollment);

export default router;
