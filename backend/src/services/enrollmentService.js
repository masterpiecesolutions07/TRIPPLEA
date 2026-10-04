import { Application } from "../models/Application.js";
import { AuditLog } from "../models/AuditLog.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { Notification } from "../models/Notification.js";
import { StudentProgress } from "../models/StudentProgress.js";

async function notify(userId, title, message) {
  await Notification.create({
    recipient: userId,
    audience: "user",
    title,
    message,
    type: "course"
  });
}

async function record(actorId, action, enrollmentId, meta) {
  await AuditLog.create({
    actor: actorId || undefined,
    action,
    entity: "Enrollment",
    entityId: String(enrollmentId),
    meta
  });
}

export async function ensureEnrollment(student, application, actorId) {
  if (!student || !application) return false;
  const course = await Course.findOne().sort({ createdAt: 1 });
  if (!course) return false;

  const existing = await Enrollment.findOne({ user: student._id, course: course._id });
  if (!existing) {
    const enrollment = await Enrollment.create({
      user: student._id,
      course: course._id,
      cohort: application.cohort || undefined,
      application: application._id,
      status: "active",
      activatedAt: new Date(),
      accessUntil: null,
      changedBy: actorId || student._id
    });
    await record(actorId || student._id, "enrollment.activate", enrollment._id, {});
    await notify(student._id, "Course open", "Your course is open. You can start it from your dashboard.");
    return true;
  }

  if (existing.status === "active" && (!existing.accessUntil || existing.accessUntil > new Date())) {
    if (application.cohort && String(existing.cohort || "") !== String(application.cohort)) {
      existing.cohort = application.cohort;
      existing.changedBy = actorId || student._id;
      await existing.save();
    }
    return false;
  }

  existing.status = "active";
  existing.reason = "";
  if (application.cohort) existing.cohort = application.cohort;
  existing.application = application._id;
  existing.activatedAt = new Date();
  existing.accessUntil = null;
  existing.changedBy = actorId || student._id;
  await existing.save();
  await record(actorId || student._id, "enrollment.restore", existing._id, {});
  await notify(student._id, "Course open", "Your course access is restored. You can open it from your dashboard.");
  return true;
}

export async function pauseEnrollment(student, actorId, reason) {
  if (!student) return false;
  const course = await Course.findOne().sort({ createdAt: 1 }).select("_id");
  if (!course) return false;
  const enrollment = await Enrollment.findOne({ user: student._id, course: course._id, status: "active" });
  if (!enrollment) return false;
  enrollment.status = "inactive";
  enrollment.reason = reason;
  enrollment.changedBy = actorId;
  await enrollment.save();
  await record(actorId, "enrollment.pause", enrollment._id, { reason });
  return true;
}

export async function openApprovedEnrollments(student) {
  const applications = await Application.find({ email: student.email, status: "approved" });
  for (const application of applications) {
    if (!application.user) {
      application.user = student._id;
      await application.save();
    }
    await ensureEnrollment(student, application, student._id);
    if (!application.cohort) continue;
    const placed = await StudentProgress.findOne({ user: student._id, cohort: application.cohort });
    if (!placed) {
      await StudentProgress.create({
        user: student._id,
        cohort: application.cohort,
        level: application.experience || "beginner"
      });
    }
  }
}
