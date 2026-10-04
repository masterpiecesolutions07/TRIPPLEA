import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDb } from "../src/config/db.js";
import { AuditLog } from "../src/models/AuditLog.js";
import { User } from "../src/models/User.js";
import { seedCourse } from "./course.js";

function requirePassword(value, label) {
  if (!value || value.length < 8 || !/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value)) {
    throw new Error(`${label} must be at least 8 characters and include upper case, lower case, and a number.`);
  }
}

async function seedAdmin() {
  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    if (existingAdmin.mustChangePassword) {
      existingAdmin.mustChangePassword = false;
      await existingAdmin.save();
    }
    console.log("Admin already exists. Skipped.");
    return;
  }
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!name || !email || !password) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in backend/.env before seeding.");
  }
  requirePassword(password, "ADMIN_PASSWORD");
  const taken = await User.findOne({ email });
  if (taken) throw new Error("ADMIN_EMAIL already belongs to another account. Seeding stopped.");
  const admin = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "admin",
    isEmailVerified: true,
    mustChangePassword: false
  });
  await AuditLog.create({ actor: admin._id, action: "seed.admin", entity: "User", entityId: String(admin._id) });
  console.log(`Admin created for ${email}.`);
}

async function seedMentor() {
  const name = process.env.MENTOR_NAME?.trim();
  const email = process.env.MENTOR_EMAIL?.trim().toLowerCase();
  const password = process.env.MENTOR_PASSWORD;
  if (!name && !email && !password) return;
  if (!name || !email || !password) {
    throw new Error("Set MENTOR_NAME, MENTOR_EMAIL, and MENTOR_PASSWORD together, or leave all three empty.");
  }
  const existingMentor = await User.findOne({ role: "mentor" });
  if (existingMentor) {
    if (existingMentor.mustChangePassword) {
      existingMentor.mustChangePassword = false;
      await existingMentor.save();
    }
    console.log("Mentor already exists. Skipped.");
    return;
  }
  requirePassword(password, "MENTOR_PASSWORD");
  const taken = await User.findOne({ email });
  if (taken) {
    console.log("MENTOR_EMAIL already exists. Skipped.");
    return;
  }
  const mentor = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "mentor",
    isEmailVerified: true,
    mustChangePassword: false
  });
  await AuditLog.create({ actor: mentor._id, action: "seed.mentor", entity: "User", entityId: String(mentor._id) });
  console.log(`Mentor created for ${email}.`);
}

await connectDb();
await seedAdmin();
await seedMentor();
await seedCourse();
await mongoose.disconnect();
console.log("Seed finished.");
