import bcrypt from "bcryptjs";
import { Application } from "../models/Application.js";
import { AuditLog } from "../models/AuditLog.js";
import { Cohort } from "../models/Cohort.js";
import { Settings } from "../models/Settings.js";
import { Trade } from "../models/Trade.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listUsers = asyncHandler(async (_req, res) => {
  const items = await User.find().sort({ createdAt: -1 }).limit(200);
  res.json({ items: items.map((user) => user.toPublic()) });
});

export const updateRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");
  if (String(user._id) === String(req.user._id) && req.body.role !== "admin") {
    throw new ApiError(400, "You cannot remove your own admin role.");
  }
  const previous = user.role;
  user.role = req.body.role;
  await user.save();
  await AuditLog.create({
    actor: req.user._id,
    action: "user.role",
    entity: "User",
    entityId: String(user._id),
    meta: { from: previous, to: user.role }
  });
  res.json({ item: user.toPublic() });
});

export const createMentor = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "That email already has an account.");
  const mentor = await User.create({
    name: req.body.name.trim(),
    email,
    passwordHash: await bcrypt.hash(req.body.password, 12),
    role: "mentor",
    mustChangePassword: true,
    isEmailVerified: true
  });
  await AuditLog.create({
    actor: req.user._id,
    action: "mentor.create",
    entity: "User",
    entityId: String(mentor._id)
  });
  res.status(201).json({ item: mentor.toPublic() });
});

export const auditLogs = asyncHandler(async (_req, res) => {
  const items = await AuditLog.find().sort({ createdAt: -1 }).limit(100).populate("actor", "name email role").lean();
  res.json({ items });
});

export const analytics = asyncHandler(async (_req, res) => {
  const [users, students, mentors, applications, cohorts, trades] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "mentor" }),
    Application.countDocuments(),
    Cohort.countDocuments(),
    Trade.countDocuments({ published: true })
  ]);
  const closed = await Trade.aggregate([
    { $match: { published: true, status: { $in: ["closed_win", "closed_loss", "break_even"] } } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  res.json({
    users,
    students,
    mentors,
    applications,
    cohorts,
    publishedTrades: trades,
    closedTrades: Object.fromEntries(closed.map((row) => [row._id, row.count])),
    note: "Trade counts are educational records, not a performance promise."
  });
});

export const getSettings = asyncHandler(async (_req, res) => {
  const settings = await Settings.findOne({ singleton: "site" });
  res.json({ item: settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const fields = {};
  ["email", "phoneDisplay", "whatsappNumber", "location", "strategyCredit"].forEach((key) => {
    if (req.body[key] !== undefined) fields[key] = req.body[key];
  });
  ["tiktok", "facebook", "youtube", "discord", "instagram"].forEach((key) => {
    if (req.body[key] !== undefined) fields[`socials.${key}`] = req.body[key];
  });
  const item = await Settings.findOneAndUpdate(
    { singleton: "site" },
    { $set: fields, $setOnInsert: { singleton: "site" } },
    { new: true, upsert: true }
  );
  await AuditLog.create({ actor: req.user._id, action: "settings.update", entity: "Settings", entityId: String(item._id) });
  res.json({ item });
});
