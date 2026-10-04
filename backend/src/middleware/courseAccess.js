import { Application } from "../models/Application.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const MESSAGES = {
  none: "Apply for the mentorship to join the course.",
  review: "Your application is under review.",
  waitlisted: "You are on the waiting list.",
  rejected: "Your application was not accepted.",
  paused: "Your course access is paused.",
  removed: "Your course access has ended.",
  ended: "Your course access has ended.",
  waiting: "Your application is approved. The course opens when your group is ready.",
  active: "Your course is open."
};

function gate(access, enrollment = null) {
  return { access, message: MESSAGES[access], enrollment };
}

export async function courseAccessFor(user) {
  const course = await Course.findOne().sort({ createdAt: 1 }).select("_id");
  const [enrollment, application] = await Promise.all([
    course ? Enrollment.findOne({ user: user._id, course: course._id }) : null,
    Application.findOne({ $or: [{ user: user._id }, { email: user.email }] }).sort({ createdAt: -1 }).select("status")
  ]);

  if (application?.status === "rejected") return gate("rejected");
  if (application?.status === "waitlisted") return gate("waitlisted");
  if (enrollment?.status === "removed") return gate("removed");
  if (enrollment?.status === "inactive") return gate("paused");
  if (enrollment?.status === "active") {
    if (enrollment.accessUntil && enrollment.accessUntil <= new Date()) return gate("ended");
    return gate("active", enrollment);
  }
  if (application?.status === "approved") return gate("waiting");
  if (application?.status === "pending" || application?.status === "under_review") return gate("review");
  return gate("none");
}

export const requireActiveEnrollment = asyncHandler(async (req, _res, next) => {
  if (req.user?.role !== "student") throw new ApiError(403, "This course is for students.");
  const access = await courseAccessFor(req.user);
  if (access.access !== "active") throw new ApiError(403, access.message);
  req.enrollment = access.enrollment;
  next();
});
