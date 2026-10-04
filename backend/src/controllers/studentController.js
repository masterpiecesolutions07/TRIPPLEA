import mongoose from "mongoose";
import { Application } from "../models/Application.js";
import { Cohort } from "../models/Cohort.js";
import { Enrollment } from "../models/Enrollment.js";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { Post } from "../models/Post.js";
import { Session } from "../models/Session.js";
import { StudentProgress } from "../models/StudentProgress.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const home = asyncHandler(async (req, res) => {
  const [progress, application] = await Promise.all([
    StudentProgress.find({ user: req.user._id }).populate("cohort", "name startDate endDate status mode").lean(),
    Application.findOne({ $or: [{ user: req.user._id }, { email: req.user.email }] }).sort({ createdAt: -1 }).select("status plan mode createdAt").lean()
  ]);
  res.json({ user: req.user.toPublic(), progress, application });
});

export const sessions = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ user: req.user._id, status: "active" }).select("accessUntil");
  const courseOpen = Boolean(enrollment) && (!enrollment.accessUntil || enrollment.accessUntil > new Date());
  if (!courseOpen) {
    res.json({ items: [] });
    return;
  }
  const items = await Session.find().sort({ startsAt: 1 }).populate("cohort", "name").lean();
  res.json({ items });
});

function noticeFilter(userId, id) {
  const filter = {
    recipient: userId,
    $or: [
      { type: { $in: ["payment", "application"] } },
      { title: { $in: ["Application approved", "Application update", "Payment"] } }
    ]
  };
  if (id) filter._id = id;
  return filter;
}

function presentNotice(item, userId, number) {
  return {
    _id: item._id,
    title: item.title,
    message: item.message,
    type: item.type,
    createdAt: item.createdAt,
    number,
    read: (item.readBy || []).some((id) => String(id) === String(userId))
  };
}

export const notifications = asyncHandler(async (req, res) => {
  const items = await Notification.find(noticeFilter(req.user._id)).sort({ createdAt: -1 }).limit(50).lean();
  res.json({
    items: items.map((item, index) => presentNotice(item, req.user._id, items.length - index))
  });
});

export const setNotificationRead = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, "That notification is no longer here.");
  const update = req.body.read
    ? { $addToSet: { readBy: req.user._id } }
    : { $pull: { readBy: req.user._id } };
  const result = await Notification.updateOne(noticeFilter(req.user._id, req.params.id), update);
  if (!result.matchedCount) throw new ApiError(404, "That notification is no longer here.");
  res.json({ message: req.body.read ? "Marked as read." : "Marked as unread." });
});

export const removeNotification = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(404, "That notification is no longer here.");
  const result = await Notification.deleteOne(noticeFilter(req.user._id, req.params.id));
  if (!result.deletedCount) throw new ApiError(404, "That notification is no longer here.");
  res.json({ message: "Notification removed." });
});

export const clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany(noticeFilter(req.user._id));
  res.json({ message: "Notifications cleared." });
});

export const applyForMentorship = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const existing = await Application.findOne({ email, status: { $in: ["pending", "under_review"] } });
  if (existing) throw new ApiError(409, "An application with this email is already being reviewed.");

  let cohort = null;
  if (req.body.cohortId) {
    if (!mongoose.isValidObjectId(req.body.cohortId)) throw new ApiError(400, "That cohort is not open for applications.");
    cohort = await Cohort.findOne({ _id: req.body.cohortId, status: "open" });
    if (!cohort) throw new ApiError(400, "That cohort is not open for applications.");
  }

  const account = await User.findOne({ email });
  if (account?.role === "student") {
    account.phone = req.body.phone;
    account.country = req.body.country;
    await account.save();
  }

  await Application.create({
    fullName: req.body.fullName.trim(),
    email,
    phone: req.body.phone,
    country: req.body.country,
    city: req.body.city || "",
    experience: req.body.experience,
    mode: req.body.mode,
    plan: req.body.plan,
    goals: req.body.goals,
    whyJoin: req.body.whyJoin,
    availability: req.body.availability || "",
    notes: `Heard via ${req.body.heard}`,
    consent: true,
    cohort: cohort?._id,
    user: account?.role === "student" ? account._id : undefined
  });
  res.status(201).json({ message: "Application received." });
});

function storySlug(name) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "story"}-${Date.now().toString(36)}`;
}

export const listMyStories = asyncHandler(async (req, res) => {
  const items = await Post.find({ author: req.user._id, category: { $in: ["success_story", "progress", "feedback", "journey"] } })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json({ items });
});

export const submitStory = asyncHandler(async (req, res) => {
  const studentName = req.body.studentName.trim();
  const item = await Post.create({
    title: studentName,
    slug: storySlug(studentName),
    body: req.body.body.trim(),
    category: req.body.kind,
    level: req.body.level,
    author: req.user._id,
    studentName,
    consent: true,
    status: "pending_review"
  });
  res.status(201).json({ item });
});
