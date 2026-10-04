import mongoose from "mongoose";
import { Application } from "../models/Application.js";
import { AuditLog } from "../models/AuditLog.js";
import { Cohort } from "../models/Cohort.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { Lesson } from "../models/Lesson.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { Module as CourseModule } from "../models/Module.js";
import { Notification } from "../models/Notification.js";
import { Phase } from "../models/Phase.js";
import { StudentProgress } from "../models/StudentProgress.js";
import { User } from "../models/User.js";
import { ensureEnrollment } from "../services/enrollmentService.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const MISSING = "That enrollment is no longer here.";

function parseDay(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) throw new ApiError(400, "Choose an end date.");
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 23, 59, 59, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new ApiError(400, "Choose an end date.");
  }
  return date;
}

function formatDay(value) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function accessState(enrollment) {
  if (enrollment.status === "inactive") return "paused";
  if (enrollment.status === "removed") return "ended";
  if (enrollment.accessUntil && new Date(enrollment.accessUntil) <= new Date()) return "ended";
  return enrollment.status === "active" ? "open" : "ended";
}

function staffMessage(enrollment) {
  if (enrollment.status === "inactive") return "Course access is paused.";
  if (enrollment.status === "removed") return "Course access has ended. You can open it again later.";
  if (enrollment.accessUntil && new Date(enrollment.accessUntil) <= new Date()) {
    return "Saved. Choose a later end date to open the course.";
  }
  if (!enrollment.accessUntil) return "Saved. Access stays open.";
  return "Saved.";
}

async function audit(actorId, action, enrollmentId, meta = {}) {
  await AuditLog.create({ actor: actorId, action, entity: "Enrollment", entityId: String(enrollmentId), meta });
}

async function notify(userId, title, message) {
  if (!userId) return;
  await Notification.create({ recipient: userId, audience: "user", title, message, type: "course" });
}

async function courseOrThrow() {
  const course = await Course.findOne().sort({ createdAt: 1 });
  if (!course) throw new ApiError(404, "The course outline is not here yet.");
  return course;
}

async function enrollmentOrThrow(id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, MISSING);
  const enrollment = await Enrollment.findById(id);
  if (!enrollment) throw new ApiError(404, MISSING);
  return enrollment;
}

async function studentForApplication(application) {
  if (application.user) {
    const linked = await User.findOne({ _id: application.user, role: "student" });
    if (linked) return linked;
  }
  return User.findOne({ email: application.email, role: "student" });
}

function present(enrollment, application) {
  const student = enrollment.user && enrollment.user.name ? enrollment.user : null;
  const cohort = enrollment.cohort && enrollment.cohort.name ? enrollment.cohort : null;
  return {
    _id: enrollment._id,
    status: enrollment.status,
    access: accessState(enrollment),
    reason: enrollment.reason || "",
    accessUntil: enrollment.accessUntil || null,
    activatedAt: enrollment.activatedAt || null,
    unlockedPhases: (enrollment.unlockedPhases || []).map(String),
    unlockedModules: (enrollment.unlockedModules || []).map(String),
    student: student ? { id: student._id, name: student.name, email: student.email } : null,
    cohort: cohort ? { id: cohort._id, name: cohort.name, endDate: cohort.endDate } : null,
    application: application ? { id: application._id, status: application.status } : null
  };
}

async function applicationsFor(enrollments) {
  const ids = enrollments.map((item) => item.application).filter(Boolean);
  const userIds = enrollments.map((item) => item.user?._id || item.user).filter(Boolean);
  const emails = enrollments.map((item) => item.user?.email).filter(Boolean);
  const rows = await Application.find({
    $or: [
      { _id: { $in: ids } },
      { user: { $in: userIds } },
      { email: { $in: emails } }
    ]
  }).sort({ createdAt: -1 }).select("status email user");
  return enrollments.map((enrollment) => rows.find((row) => (
    String(row._id) === String(enrollment.application)
    || String(row.user) === String(enrollment.user?._id || enrollment.user)
    || row.email === enrollment.user?.email
  )) || null);
}

async function loadEnrollments() {
  const course = await courseOrThrow();
  return Enrollment.find({ course: course._id })
    .populate("user", "name email")
    .populate("cohort", "name endDate")
    .sort({ updatedAt: -1 });
}

function noticeFor(previous, enrollment, dateChanged, cleared) {
  const statusChanged = previous !== enrollment.status;
  const until = enrollment.accessUntil ? formatDay(enrollment.accessUntil) : "";
  if (statusChanged && enrollment.status === "removed") return ["Course update", "Your course access has ended."];
  if (statusChanged && enrollment.status === "inactive") return ["Course update", "Your course access is paused."];
  if (statusChanged && enrollment.status === "active" && dateChanged && until) {
    return ["Course open", `Your course access is open until ${until}.`];
  }
  if (statusChanged && enrollment.status === "active") {
    return ["Course open", "Your course access is open. You can start it from your dashboard."];
  }
  if (cleared && dateChanged) return ["Course update", "Your course access stays open."];
  if (dateChanged && until) return ["Course update", `Your course access now runs until ${until}.`];
  return null;
}

async function applyChange(enrollment, input, actorId) {
  const previous = enrollment.status;
  const previousUntil = enrollment.accessUntil ? new Date(enrollment.accessUntil).getTime() : 0;
  if (input.status) {
    enrollment.status = input.status;
    if (input.status === "active" && !enrollment.activatedAt) enrollment.activatedAt = new Date();
  }
  if (input.reason !== undefined) enrollment.reason = input.reason || "";
  if (input.clearUntil) enrollment.accessUntil = null;
  else if (input.accessUntil) enrollment.accessUntil = input.accessUntil;
  if (input.unlockedPhases) enrollment.unlockedPhases = input.unlockedPhases;
  if (input.unlockedModules) enrollment.unlockedModules = input.unlockedModules;
  enrollment.changedBy = actorId;
  await enrollment.save();
  const dateChanged = input.clearUntil
    ? previousUntil !== 0
    : Boolean(input.accessUntil) && input.accessUntil.getTime() !== previousUntil;
  await audit(actorId, "enrollment.update", enrollment._id, { status: enrollment.status });
  const notice = noticeFor(previous, enrollment, dateChanged, Boolean(input.clearUntil));
  if (notice) await notify(enrollment.user, notice[0], notice[1]);
  return enrollment;
}

async function idsInCourse(ids, Model, filter) {
  const unique = [...new Set((ids || []).map(String))];
  if (unique.some((id) => !mongoose.isValidObjectId(id))) throw new ApiError(400, "Refresh the page and try again.");
  if (!unique.length) return [];
  const rows = await Model.find({ _id: { $in: unique }, ...filter }).select("_id");
  if (rows.length !== unique.length) throw new ApiError(400, "Refresh the page and try again.");
  return rows.map((row) => row._id);
}

export const listEnrollments = asyncHandler(async (_req, res) => {
  const course = await courseOrThrow();
  const enrollments = await loadEnrollments();
  const applications = await applicationsFor(enrollments);
  const enrolledUsers = new Set(enrollments.map((item) => String(item.user?._id || item.user || "")).filter((id) => mongoose.isValidObjectId(id)));
  const enrolledEmails = new Set(enrollments.map((item) => item.user?.email).filter(Boolean));
  const approved = await Application.find({ status: "approved" }).sort({ createdAt: -1 }).limit(200);
  const accountEmails = approved.map((item) => item.email);
  const accounts = await User.find({ email: { $in: accountEmails }, role: "student" }).select("email");
  const accountSet = new Set(accounts.map((item) => item.email));
  const waiting = approved
    .filter((item) => !enrolledUsers.has(String(item.user || "")) && !enrolledEmails.has(item.email))
    .map((item) => ({
      applicationId: item._id,
      name: item.fullName,
      email: item.email,
      hasAccount: accountSet.has(item.email) || enrolledUsers.has(String(item.user || "")),
      cohortId: item.cohort ? String(item.cohort) : ""
    }));
  res.json({
    items: enrollments.map((item, index) => present(item, applications[index])),
    waiting,
    unlockMode: course.unlockMode
  });
});

export const getEnrollment = asyncHandler(async (req, res) => {
  const course = await courseOrThrow();
  const enrollment = await enrollmentOrThrow(req.params.id);
  await enrollment.populate("user", "name email");
  await enrollment.populate("cohort", "name endDate");
  const [application, phases, moduleIds] = await Promise.all([
    applicationsFor([enrollment]).then((rows) => rows[0]),
    Phase.find({ course: course._id }).sort({ order: 1 }).select("title"),
    Phase.find({ course: course._id }).distinct("_id")
  ]);
  const moduleRows = await CourseModule.find({ phase: { $in: moduleIds } }).sort({ order: 1 }).select("title phase");
  const lessonModules = moduleRows.map((item) => item._id);
  const [completed, total] = await Promise.all([
    LessonProgress.countDocuments({ user: enrollment.user?._id || enrollment.user, completed: true }),
    Lesson.countDocuments({ module: { $in: lessonModules } })
  ]);
  const byPhase = new Map();
  for (const item of moduleRows) {
    const key = String(item.phase);
    byPhase.set(key, [...(byPhase.get(key) || []), { _id: item._id, title: item.title }]);
  }
  res.json({
    item: present(enrollment, application),
    unlockMode: course.unlockMode,
    phases: phases.map((phase) => ({
      _id: phase._id,
      title: phase.title,
      modules: byPhase.get(String(phase._id)) || []
    })),
    progress: { completed, total }
  });
});

export const openEnrollment = asyncHandler(async (req, res) => {
  await courseOrThrow();
  if (!mongoose.isValidObjectId(req.body.applicationId)) throw new ApiError(404, "That application is no longer here.");
  const application = await Application.findById(req.body.applicationId);
  if (!application) throw new ApiError(404, "That application is no longer here.");
  let cohort = null;
  if (req.body.cohortId) {
    if (!mongoose.isValidObjectId(req.body.cohortId)) throw new ApiError(404, "That group is no longer here.");
    cohort = await Cohort.findById(req.body.cohortId);
    if (!cohort) throw new ApiError(404, "That group is no longer here.");
  }
  if (application.status !== "approved") throw new ApiError(400, "Approve the application before opening the course.");
  const student = await studentForApplication(application);
  if (!student) {
    throw new ApiError(400, "This person has not created a student account yet. Ask them to sign up with the same email.");
  }
  application.user = student._id;
  if (cohort) application.cohort = cohort._id;
  await application.save();
  const seated = cohort ? await StudentProgress.findOne({ user: student._id, cohort: cohort._id }) : true;
  if (!seated) {
    await StudentProgress.create({
      user: student._id,
      cohort: cohort._id,
      level: application.experience || "beginner"
    });
    await Cohort.updateOne({ _id: cohort._id }, { $inc: { seatsTaken: 1 } });
  }
  const opened = await ensureEnrollment(student, application, req.user._id);
  const enrollment = await Enrollment.findOne({ user: student._id, course: (await courseOrThrow())._id });
  res.status(opened ? 201 : 200).json({
    message: opened ? "The course is open." : "The course is already open for this student.",
    id: enrollment ? String(enrollment._id) : ""
  });
});

export const updateEnrollmentStatus = asyncHandler(async (req, res) => {
  const enrollment = await enrollmentOrThrow(req.params.id);
  await applyChange(enrollment, { status: req.body.status, reason: req.body.reason || "" }, req.user._id);
  await enrollment.populate("user", "name email");
  await enrollment.populate("cohort", "name endDate");
  const application = (await applicationsFor([enrollment]))[0];
  res.json({ message: staffMessage(enrollment), item: present(enrollment, application) });
});

export const updateEnrollmentAccess = asyncHandler(async (req, res) => {
  const course = await courseOrThrow();
  const enrollment = await enrollmentOrThrow(req.params.id);
  const { accessUntil, unlockedPhases, unlockedModules } = req.body;
  if (accessUntil === undefined && !unlockedPhases && !unlockedModules) throw new ApiError(400, "Choose what to change.");
  const phaseIds = await Phase.find({ course: course._id }).distinct("_id");
  const input = {};
  if (accessUntil === "") input.clearUntil = true;
  else if (accessUntil) input.accessUntil = parseDay(accessUntil);
  if (unlockedPhases) input.unlockedPhases = await idsInCourse(unlockedPhases, Phase, { course: course._id });
  if (unlockedModules) input.unlockedModules = await idsInCourse(unlockedModules, CourseModule, { phase: { $in: phaseIds } });
  await applyChange(enrollment, input, req.user._id);
  await enrollment.populate("user", "name email");
  await enrollment.populate("cohort", "name endDate");
  const application = (await applicationsFor([enrollment]))[0];
  res.json({ message: staffMessage(enrollment), item: present(enrollment, application) });
});

export const updateEnrollments = asyncHandler(async (req, res) => {
  if (!req.body.status && req.body.accessUntil === undefined) throw new ApiError(400, "Choose what to change.");
  const ids = [...new Set(req.body.ids.map(String))];
  if (ids.some((id) => !mongoose.isValidObjectId(id))) throw new ApiError(400, "One of those students is no longer here.");
  const rows = await Enrollment.find({ _id: { $in: ids } });
  if (rows.length !== ids.length) throw new ApiError(400, "One of those students is no longer here.");
  const input = {};
  if (req.body.status) input.status = req.body.status;
  if (req.body.reason !== undefined) input.reason = req.body.reason || "";
  if (req.body.accessUntil === "") input.clearUntil = true;
  else if (req.body.accessUntil) input.accessUntil = parseDay(req.body.accessUntil);
  for (const enrollment of rows) await applyChange(enrollment, input, req.user._id);
  res.json({ message: rows.length === 1 ? "Saved." : `Saved for ${rows.length} students.` });
});

export const extendCohortAccess = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.body.cohortId)) throw new ApiError(404, "That group is no longer here.");
  const cohort = await Cohort.findById(req.body.cohortId).select("name");
  if (!cohort) throw new ApiError(404, "That group is no longer here.");
  const rows = await Enrollment.find({ cohort: cohort._id });
  if (!rows.length) {
    res.json({ message: "No students in that group yet." });
    return;
  }
  const accessUntil = parseDay(req.body.accessUntil);
  for (const enrollment of rows) await applyChange(enrollment, { accessUntil }, req.user._id);
  res.json({ message: `The end date is saved for ${rows.length} ${rows.length === 1 ? "student" : "students"} in ${cohort.name}.` });
});

export const removeEnrollment = asyncHandler(async (req, res) => {
  if (req.query.permanent !== "1" || req.user.role !== "admin") {
    throw new ApiError(403, "Only an admin can remove this record.");
  }
  const enrollment = await enrollmentOrThrow(req.params.id);
  await audit(req.user._id, "enrollment.delete", enrollment._id, {});
  await Enrollment.deleteOne({ _id: enrollment._id });
  res.json({ message: "Removed." });
});
