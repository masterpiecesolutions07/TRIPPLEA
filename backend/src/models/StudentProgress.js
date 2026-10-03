import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    title: { type: String, required: true },
    status: { type: String, enum: ["locked", "available", "completed"], default: "locked" },
    completedAt: { type: Date }
  },
  { _id: false }
);

const studentProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    cohort: { type: mongoose.Schema.Types.ObjectId, ref: "Cohort", required: true },
    modules: { type: [moduleSchema], default: [] },
    level: { type: String, default: "beginner" },
    mentorNotes: { type: String, default: "" },
    percentage: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const StudentProgress = mongoose.model("StudentProgress", studentProgressSchema);
