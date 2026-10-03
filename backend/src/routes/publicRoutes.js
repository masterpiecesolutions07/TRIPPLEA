import { Router } from "express";
import { applyForMentorship } from "../controllers/studentController.js";
import { Certificate } from "../models/Certificate.js";
import { Cohort } from "../models/Cohort.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validateMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { mentorshipApplicationSchema } from "../validators/staffValidators.js";

const router = Router();

router.get("/cohorts", asyncHandler(async (_req, res) => {
  const items = await Cohort.find({ status: "open" })
    .select("name startDate endDate mode seatLimit seatsTaken priceFrom")
    .sort({ startDate: 1 })
    .lean();
  res.json({ items });
}));

router.get("/certificates", asyncHandler(async (_req, res) => {
  const items = await Certificate.find({ status: "published", consent: true })
    .select("title category studentDisplayName date amount description image.url featured order")
    .sort({ featured: -1, order: 1, date: -1 })
    .limit(24)
    .lean();
  res.json({ items });
}));

router.post("/applications", authLimiter, validate(mentorshipApplicationSchema), applyForMentorship);

export default router;
