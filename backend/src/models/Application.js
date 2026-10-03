import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    country: { type: String, default: "" },
    city: { type: String, default: "" },
    experience: { type: String, default: "" },
    mode: { type: String, enum: ["online", "physical"], default: "online" },
    plan: { type: String, default: "starter" },
    goals: { type: String, default: "" },
    whyJoin: { type: String, default: "" },
    availability: { type: String, default: "" },
    attachments: [{ url: String, publicId: String }],
    consent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected", "waitlisted"],
      default: "pending",
      index: true
    },
    notes: { type: String, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cohort: { type: mongoose.Schema.Types.ObjectId, ref: "Cohort", index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

applicationSchema.index({ cohort: 1, status: 1 });

export const Application = mongoose.model("Application", applicationSchema);
