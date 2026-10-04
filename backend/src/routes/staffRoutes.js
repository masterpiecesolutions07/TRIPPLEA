import { Router } from "express";
import {
  addCohortStudents,
  createAlert,
  createCertificate,
  createCohort,
  createSession,
  createMessage,
  createPost,
  createTrade,
  listAlerts,
  deleteApplication,
  deleteSession,
  listApplications,
  listCertificates,
  listCohorts,
  listMessages,
  listPeople,
  listPosts,
  listSessions,
  listStudents,
  listTrades,
  overview,
  sendPaymentAlert,
  setStoryPublished,
  updateApplication,
  updateApplicationStatus,
  updateMessageStatus,
  updateProfile,
  updateStudent,
  updateUserStatus
} from "../controllers/staffController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import courseManageRoutes from "./courseManageRoutes.js";
import enrollmentRoutes from "./enrollmentRoutes.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  alertSchema,
  applicationUpdateSchema,
  imageSchema,
  cohortSchema,
  cohortStudentsSchema,
  sessionSchema,
  messageSchema,
  messageStatusSchema,
  paymentAlertSchema,
  profileSchema,
  accountStatusSchema,
  statusSchema,
  storyPublishSchema,
  storySchema,
  studentUpdateSchema,
} from "../validators/staffValidators.js";

const router = Router();
router.use(protect, authorize("mentor", "admin"));
router.use("/course", courseManageRoutes);
router.use("/enrollments", enrollmentRoutes);

router.get("/overview", overview);
router.get("/applications", listApplications);
router.patch("/applications/:id/status", validate(statusSchema), updateApplicationStatus);
router.delete("/applications/:id", deleteApplication);
router.get("/users", listPeople);
router.patch("/users/:id/status", validate(accountStatusSchema), updateUserStatus);
router.patch("/applications/:id", validate(applicationUpdateSchema), updateApplication);
router.post("/applications/:id/payment-alert", validate(paymentAlertSchema), sendPaymentAlert);
router.get("/cohorts", listCohorts);
router.post("/cohorts", validate(cohortSchema), createCohort);
router.post("/cohorts/:id/students", validate(cohortStudentsSchema), addCohortStudents);
router.get("/sessions", listSessions);
router.post("/sessions", validate(sessionSchema), createSession);
router.delete("/sessions/:id", deleteSession);
router.get("/messages", listMessages);
router.post("/messages", validate(messageSchema), createMessage);
router.patch("/messages/:id/status", validate(messageStatusSchema), updateMessageStatus);
router.get("/certificates", listCertificates);
router.post("/certificates", validate(imageSchema), createCertificate);
router.get("/trades", listTrades);
router.post("/trades", validate(imageSchema), createTrade);
router.get("/alerts", listAlerts);
router.post("/alerts", validate(alertSchema), createAlert);
router.get("/posts", listPosts);
router.post("/posts", validate(storySchema), createPost);
router.patch("/posts/:id/publish", validate(storyPublishSchema), setStoryPublished);
router.get("/students", listStudents);
router.patch("/students/:id", validate(studentUpdateSchema), updateStudent);
router.patch("/profile", validate(profileSchema), updateProfile);

export default router;
