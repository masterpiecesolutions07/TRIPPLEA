import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    cohort: { type: mongoose.Schema.Types.ObjectId, ref: "Cohort", index: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
    status: { type: String, enum: ["active", "inactive", "removed"], default: "active", index: true },
    reason: { type: String, default: "", maxlength: 500 },
    activatedAt: { type: Date },
    accessUntil: { type: Date },
    unlockedPhases: [{ type: mongoose.Schema.Types.ObjectId, ref: "Phase" }],
    unlockedModules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
