import { Router } from "express";
import {
  createCohort,
  listAlerts,
  listApplications,
  listCertificates,
  listCohorts,
  listMessages,
  listPosts,
  listStudents,
  listTestimonials,
  listTrades,
  overview,
  updateApplicationStatus
} from "../controllers/staffController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { cohortSchema, statusSchema } from "../validators/staffValidators.js";

const router = Router();
router.use(protect, authorize("mentor", "admin"));

router.get("/overview", overview);
router.get("/applications", listApplications);
router.patch("/applications/:id/status", validate(statusSchema), updateApplicationStatus);
router.get("/cohorts", listCohorts);
router.post("/cohorts", validate(cohortSchema), createCohort);
router.get("/messages", listMessages);
router.get("/certificates", listCertificates);
router.get("/trades", listTrades);
router.get("/alerts", listAlerts);
router.get("/posts", listPosts);
router.get("/testimonials", listTestimonials);
router.get("/students", listStudents);

export default router;
