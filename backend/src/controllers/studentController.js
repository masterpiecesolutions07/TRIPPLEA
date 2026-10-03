import mongoose from "mongoose";
import { Application } from "../models/Application.js";
import { Cohort } from "../models/Cohort.js";
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
    Application.findOne({ user: req.user._id }).sort({ createdAt: -1 }).select("status plan mode createdAt").lean()
  ]);
  res.json({ user: req.user.toPublic(), progress, application });
});

export const sessions = asyncHandler(async (req, res) => {
  const progress = await StudentProgress.find({ user: req.user._id }).select("cohort");
  const cohortIds = progress.map((item) => item.cohort);
  const items = await Session.find({ cohort: { $in: cohortIds } }).sort({ startsAt: 1 }).lean();
  res.json({ items });
});

export const notifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({
    $or: [{ recipient: req.user._id }, { audience: "students" }]
  }).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ items });
});

export const applyForMentorship = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const existing = await Application.findOne({ email, status: { $in: ["pending", "under_review"] } });
  if (existing) throw new ApiError(409, "An application with this email is already in review.");

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

export const submitStory = asyncHandler(async (req, res) => {
  if (req.body.consent !== true) throw new ApiError(400, "Consent is required before a story can be saved.");
  const slug = `${req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;
  const item = await Post.create({
    title: req.body.title,
    slug,
    body: req.body.body,
    category: "success_story",
    author: req.user._id,
    studentName: req.user.name,
    consent: true,
    status: "pending_review"
  });
  res.status(201).json({ item });
});
