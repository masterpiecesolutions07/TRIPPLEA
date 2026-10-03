import mongoose from "mongoose";

const waitlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    cohort: { type: mongoose.Schema.Types.ObjectId, ref: "Cohort" },
    notified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Waitlist = mongoose.model("Waitlist", waitlistSchema);
