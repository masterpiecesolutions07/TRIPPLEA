import { Alert } from "../models/Alert.js";
import { Application } from "../models/Application.js";
import { AuditLog } from "../models/AuditLog.js";
import { Certificate } from "../models/Certificate.js";
import { Cohort } from "../models/Cohort.js";
import { ContactMessage } from "../models/ContactMessage.js";
import { Notification } from "../models/Notification.js";
import { Post } from "../models/Post.js";
import { Session } from "../models/Session.js";
import { StudentProgress } from "../models/StudentProgress.js";
import { Trade } from "../models/Trade.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { saveImage } from "../utils/saveImage.js";
import { ensureEnrollment, pauseEnrollment } from "../services/enrollmentService.js";

function addMonths(date, months) {
  const next = new Date(date);
  const day = next.getDate();
  next.setMonth(next.getMonth() + months);
  if (next.getDate() < day) next.setDate(0);
  return next;
}

async function audit(req, action, entity, entityId, meta = {}) {
  await AuditLog.create({ actor: req.user._id, action, entity, entityId: String(entityId || ""), meta });
}

async function studentFor(application) {
  if (application.user) {
    const linked = await User.findOne({ _id: application.user, role: "student" });
    if (linked) return linked;
  }
  return User.findOne({ email: application.email, role: "student" });
}

async function notifyStudent(student, title, message, type) {
  if (!student) return;
  await Notification.create({
    recipient: student._id,
    audience: "user",
    title,
    message,
    type
  });
}

async function enrol(student, application) {
  if (!student || !application.cohort) return;
  const exists = await StudentProgress.findOne({ user: student._id, cohort: application.cohort });
  if (exists) return;
  await StudentProgress.create({
    user: student._id,
    cohort: application.cohort,
    level: application.experience || "beginner"
  });
  await Cohort.updateOne({ _id: application.cohort }, { $inc: { seatsTaken: 1 } });
}

async function applyDecision(req, application, statusChanged) {
  application.reviewedBy = req.user._id;
  const student = await studentFor(application);
  if (student) application.user = student._id;
  await application.save();
  if (statusChanged && application.status === "approved") {
    await enrol(student, application);
    await ensureEnrollment(student, application, req.user._id);
    await notifyStudent(student, "Application approved", "Your mentorship application was approved. Open your dashboard for the next step.", "application");
  } else if (statusChanged && application.status === "rejected") {
    await pauseEnrollment(student, req.user._id, "Application was not accepted.");
    await notifyStudent(student, "Application update", "Your application was not accepted. The course stays closed.", "application");
  } else if (statusChanged && application.status === "waitlisted") {
    await pauseEnrollment(student, req.user._id, "On the waiting list.");
    await notifyStudent(student, "Application update", "You are on the waiting list. The course stays closed until a place opens.", "application");
  } else if (statusChanged && await pauseEnrollment(student, req.user._id, "Application is under review.")) {
    await notifyStudent(student, "Application update", "Your application is under review. The course stays closed until it is approved.", "application");
  }
  await audit(req, "application.update", "Application", application._id, { status: application.status });
}

export const overview = asyncHandler(async (_req, res) => {
  const [applications, cohorts, messages, certificates, trades, students] = await Promise.all([
    Application.countDocuments(),
    Cohort.countDocuments(),
    ContactMessage.countDocuments({ status: "new" }),
    Certificate.countDocuments(),
    Trade.countDocuments(),
    User.countDocuments({ role: "student" })
  ]);
  const byStatus = await Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
  res.json({
    applications,
    cohorts,
    messages,
    certificates,
    trades,
    students,
    applicationStatus: Object.fromEntries(byStatus.map((row) => [row._id, row.count]))
  });
});

function searchClause(raw) {
  const q = String(raw || "").trim().slice(0, 80);
  if (!q) return null;
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(safe, "i");
}

export const listApplications = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const query = searchClause(req.query.q);
  if (query) filter.$or = [{ fullName: query }, { email: query }, { phone: query }, { country: query }, { city: query }];
  const items = await Application.find(filter).sort({ createdAt: -1 }).limit(200).populate("cohort", "name").lean();
  res.json({ items });
});

export const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw new ApiError(404, "That application is no longer here.");
  if (application.status === "approved") {
    const student = await studentFor(application);
    await pauseEnrollment(student, req.user._id, "Application was removed.");
  }
  await application.deleteOne();
  await audit(req, "application.delete", "Application", application._id, { email: application.email });
  res.json({ message: "Application removed." });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw new ApiError(404, "That application is no longer here.");
  application.status = req.body.status;
  await applyDecision(req, application, true);
  res.json({ item: application });
});

export const updateApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw new ApiError(404, "That application is no longer here.");
  const previous = application.status;
  ["plan", "mode", "phone", "notes"].forEach((key) => {
    if (req.body[key] !== undefined) application[key] = req.body[key];
  });
  if (req.body.status) application.status = req.body.status;
  await applyDecision(req, application, previous !== application.status);
  res.json({ item: application });
});

export const sendPaymentAlert = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw new ApiError(404, "That application is no longer here.");
  const student = await studentFor(application);
  if (!student) {
    throw new ApiError(400, "This person has not created a student account yet. Ask them to sign up with the same email, then send the note again.");
  }
  application.user = student._id;
  await application.save();
  await Notification.create({
    recipient: student._id,
    audience: "user",
    title: "Payment",
    message: req.body.message.trim(),
    type: "payment"
  });
  await audit(req, "application.payment_alert", "Application", application._id, {});
  res.status(201).json({ message: "The note is now on the student's page." });
});

export const listCohorts = asyncHandler(async (_req, res) => {
  const items = await Cohort.find().sort({ startDate: 1 }).lean();
  res.json({ items });
});

export const createCohort = asyncHandler(async (req, res) => {
  const startDate = new Date(req.body.startDate);
  if (Number.isNaN(startDate.getTime())) throw new ApiError(400, "Enter a valid start date.");
  const cohort = await Cohort.create({
    name: req.body.name,
    startDate,
    endDate: addMonths(startDate, 3),
    mode: req.body.mode,
    seatLimit: req.body.seatLimit || 20,
    priceFrom: req.body.priceFrom ?? 120,
    sessionLinks: { zoom: req.body.zoom || "", meet: req.body.meet || "" },
    venue: req.body.venue || "",
    notes: req.body.notes || "",
    status: "draft",
    createdBy: req.user._id
  });
  if (req.body.publishAlert) {
    const alert = await Alert.create({
      title: `${cohort.name} is now listed`,
      message: `${cohort.name} starts ${startDate.toLocaleDateString("en-GB")}. ${cohort.seatLimit} seats. Plans from ${cohort.priceFrom} USD.`,
      type: "cohort",
      link: "/programme",
      isActive: true,
      cohort: cohort._id,
      autoGenerated: true,
      createdBy: req.user._id
    });
    cohort.alertId = alert._id;
    await cohort.save();
  }
  await audit(req, "cohort.create", "Cohort", cohort._id, { name: cohort.name });
  res.status(201).json({ item: cohort });
});

export const addCohortStudents = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, "That group is no longer here.");
  const cohort = await Cohort.findById(req.params.id);
  if (!cohort) throw new ApiError(404, "That group is no longer here.");
  const ids = [...new Set(req.body.applicationIds)].filter((id) => mongoose.isValidObjectId(id));
  const applications = await Application.find({ _id: { $in: ids }, status: "approved" });
  if (!applications.length) throw new ApiError(400, "Choose approved applicants.");

  const newcomers = applications.filter((item) => String(item.cohort || "") !== String(cohort._id));
  const room = Math.max(0, (cohort.seatLimit || 0) - (cohort.seatsTaken || 0));
  if (newcomers.length > room) {
    throw new ApiError(400, "This group does not have enough open seats for everyone you selected.");
  }

  for (const application of applications) {
    const student = await studentFor(application);
    if (student) application.user = student._id;
    const alreadyHere = String(application.cohort || "") === String(cohort._id);
    if (!alreadyHere && application.cohort && student) {
      const moved = await StudentProgress.findOneAndUpdate(
        { user: student._id, cohort: application.cohort },
        { $set: { cohort: cohort._id } }
      );
      if (moved) {
        await Cohort.updateOne({ _id: application.cohort, seatsTaken: { $gt: 0 } }, { $inc: { seatsTaken: -1 } });
      }
    }
    application.cohort = cohort._id;
    application.reviewedBy = req.user._id;
    await application.save();
    if (student) {
      const placed = await StudentProgress.findOne({ user: student._id, cohort: cohort._id });
      if (!placed) {
        await StudentProgress.create({
          user: student._id,
          cohort: cohort._id,
          level: application.experience || "beginner"
        });
      }
      await ensureEnrollment(student, application, req.user._id);
      if (!alreadyHere) {
        await notifyStudent(
          student,
          "Application update",
          `You were added to ${cohort.name}. Sessions for this group show on your dashboard.`,
          "application"
        );
      }
    }
    if (!alreadyHere) cohort.seatsTaken += 1;
  }

  if (!newcomers.length) {
    res.json({ message: "Those students are already in this group.", item: cohort });
    return;
  }
  await cohort.save();
  await audit(req, "cohort.add_students", "Cohort", cohort._id, { count: newcomers.length });
  const count = newcomers.length;
  res.json({
    message: count === 1 ? "1 student added to the group." : `${count} students added to the group.`,
    item: cohort
  });
});

function sessionLink(value) {
  const link = String(value || "").trim();
  if (!link) return "";
  if (!/^https:\/\/\S+$/i.test(link)) throw new ApiError(400, "Use a full https link for the session.");
  return link;
}

export const listSessions = asyncHandler(async (_req, res) => {
  const items = await Session.find().sort({ startsAt: 1 }).populate("cohort", "name").lean();
  res.json({ items });
});

export const createSession = asyncHandler(async (req, res) => {
  const startsAt = new Date(req.body.startsAt);
  if (Number.isNaN(startsAt.getTime())) throw new ApiError(400, "Choose a date and time.");
  let cohortId;
  if (req.body.cohortId) {
    if (!mongoose.isValidObjectId(req.body.cohortId)) throw new ApiError(400, "Choose a group.");
    const cohort = await Cohort.findById(req.body.cohortId);
    if (!cohort) throw new ApiError(400, "Choose a group.");
    cohortId = cohort._id;
  }
  const session = await Session.create({
    title: req.body.title.trim(),
    startsAt,
    mode: req.body.mode,
    platform: req.body.platform,
    link: sessionLink(req.body.link),
    venue: req.body.venue || "",
    cohort: cohortId
  });
  await audit(req, "session.create", "Session", session._id, { title: session.title });
  const item = await Session.findById(session._id).populate("cohort", "name").lean();
  res.status(201).json({ item });
});

export const deleteSession = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, "That session is no longer here.");
  const session = await Session.findById(req.params.id);
  if (!session) throw new ApiError(404, "That session is no longer here.");
  await session.deleteOne();
  await audit(req, "session.delete", "Session", session._id, { title: session.title });
  res.json({ message: "Session removed." });
});

function listModel(Model) {
  return asyncHandler(async (_req, res) => {
    const items = await Model.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json({ items });
  });
}

export const listMessages = listModel(ContactMessage);
export const listCertificates = listModel(Certificate);
export const listTrades = listModel(Trade);
export const listAlerts = listModel(Alert);
export const listPosts = asyncHandler(async (_req, res) => {
  const items = await Post.find({ category: { $in: ["success_story", "progress", "feedback", "journey"] } })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ items });
});

export const listStudents = asyncHandler(async (_req, res) => {
  const users = await User.find({ role: "student" }).sort({ createdAt: -1 }).limit(100);
  const emails = users.map((user) => user.email);
  const ids = users.map((user) => user._id);
  const applications = await Application.find({
    $or: [{ user: { $in: ids } }, { email: { $in: emails } }]
  }).sort({ createdAt: -1 }).lean();
  const items = users.map((user) => {
    const application = applications.find((item) => String(item.user) === String(user._id) || item.email === user.email);
    return {
      ...user.toPublic(),
      application: application ? {
        id: application._id,
        status: application.status,
        plan: application.plan,
        mode: application.mode,
        phone: application.phone,
        notes: application.notes
      } : null
    };
  });
  res.json({ items });
});

function personView(user, application) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    country: user.country || "",
    isActive: user.isActive !== false,
    createdAt: user.createdAt,
    applicationStatus: application?.status || ""
  };
}

export const listPeople = asyncHandler(async (req, res) => {
  const filter = {};
  if (["student", "mentor", "admin"].includes(req.query.role)) filter.role = req.query.role;
  if (req.query.status === "active") filter.isActive = true;
  if (req.query.status === "paused") filter.isActive = false;
  const query = searchClause(req.query.q);
  if (query) filter.$or = [{ name: query }, { email: query }];
  const users = await User.find(filter).sort({ createdAt: -1 }).limit(200);
  const emails = users.map((user) => user.email);
  const ids = users.map((user) => user._id);
  const applications = emails.length
    ? await Application.find({ $or: [{ user: { $in: ids } }, { email: { $in: emails } }] }).sort({ createdAt: -1 }).lean()
    : [];
  const items = users.map((user) => {
    const application = applications.find((item) => String(item.user) === String(user._id) || item.email === user.email);
    return personView(user, application);
  });
  res.json({ items });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "That account is no longer here.");
  if (String(user._id) === String(req.user._id)) throw new ApiError(400, "You cannot change your own account.");
  if (req.user.role !== "admin" && user.role !== "student") {
    throw new ApiError(403, "You can change student accounts only.");
  }
  user.isActive = req.body.isActive;
  if (!user.isActive) user.refreshTokens = [];
  await user.save();
  if (user.role === "student") {
    await notifyStudent(
      user,
      user.isActive ? "Account open" : "Account paused",
      user.isActive ? "Your account is open again. You can sign in." : "Your account is paused. Sign-in stays closed until it is opened again.",
      "info"
    );
  }
  await audit(req, "user.status", "User", user._id, { isActive: user.isActive });
  const application = await Application.findOne({ $or: [{ user: user._id }, { email: user.email }] }).sort({ createdAt: -1 }).lean();
  res.json({ item: personView(user, application), message: user.isActive ? "Account opened." : "Account paused." });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: "student" });
  if (!user) throw new ApiError(404, "That student is no longer here.");
  if (req.body.phone !== undefined) user.phone = req.body.phone;
  if (req.body.country !== undefined) user.country = req.body.country;
  await user.save();
  await audit(req, "student.update", "User", user._id, {});
  res.json({ item: user.toPublic() });
});

export const updateProfile = asyncHandler(async (req, res) => {
  req.user.name = req.body.name.trim();
  if (req.body.phone !== undefined) req.user.phone = req.body.phone;
  if (req.body.country !== undefined) req.user.country = req.body.country;
  await req.user.save();
  res.json({ user: req.user.toPublic() });
});

function slugify(title) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "story"}-${Date.now().toString(36)}`;
}

export const createCertificate = asyncHandler(async (req, res) => {
  const url = await saveImage(req.body.image, "certificates");
  const item = await Certificate.create({
    title: "Certificate",
    category: "other",
    consent: true,
    image: { url },
    status: "published",
    uploadedBy: req.user._id
  });
  await audit(req, "certificate.create", "Certificate", item._id, {});
  res.status(201).json({ item });
});

export const createTrade = asyncHandler(async (req, res) => {
  const url = await saveImage(req.body.image, "trades");
  const item = await Trade.create({
    images: [{ url }],
    published: true,
    postedBy: req.user._id
  });
  await audit(req, "trade.create", "Trade", item._id, {});
  res.status(201).json({ item });
});

export const createAlert = asyncHandler(async (req, res) => {
  const item = await Alert.create({
    title: req.body.title.trim(),
    message: req.body.message.trim(),
    type: req.body.type,
    link: req.body.link || "",
    isActive: true,
    createdBy: req.user._id
  });
  await audit(req, "alert.create", "Alert", item._id, {});
  res.status(201).json({ item });
});

export const createPost = asyncHandler(async (req, res) => {
  const studentName = req.body.studentName.trim();
  const item = await Post.create({
    title: studentName,
    slug: slugify(studentName),
    body: req.body.body.trim(),
    category: req.body.kind,
    level: req.body.level,
    studentName,
    consent: true,
    status: "pending_review",
    author: req.user._id
  });
  await audit(req, "post.create", "Post", item._id, { status: item.status });
  res.status(201).json({ item });
});

export const setStoryPublished = asyncHandler(async (req, res) => {
  const item = await Post.findById(req.params.id);
  if (!item) throw new ApiError(404, "That story is no longer here.");
  item.status = req.body.published ? "published" : "pending_review";
  item.publishedAt = req.body.published ? new Date() : null;
  await item.save();
  await audit(req, req.body.published ? "post.publish" : "post.unpublish", "Post", item._id, {});
  res.json({ item });
});

export const createMessage = asyncHandler(async (req, res) => {
  const item = await ContactMessage.create({
    name: req.body.name.trim(),
    email: req.body.email.toLowerCase(),
    subject: req.body.subject || "",
    message: req.body.message.trim()
  });
  await audit(req, "message.create", "ContactMessage", item._id, {});
  res.status(201).json({ item });
});

export const updateMessageStatus = asyncHandler(async (req, res) => {
  const item = await ContactMessage.findById(req.params.id);
  if (!item) throw new ApiError(404, "That message is no longer here.");
  item.status = req.body.status;
  await item.save();
  res.json({ item });
});
