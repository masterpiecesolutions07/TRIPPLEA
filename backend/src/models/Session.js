import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    startsAt: { type: Date, required: true },
    mode: { type: String, enum: ["online", "physical"], default: "online" },
    platform: { type: String, enum: ["zoom", "meet", "room"], default: "zoom" },
    link: { type: String, default: "" },
    venue: { type: String, default: "" },
    cohort: { type: mongoose.Schema.Types.ObjectId, ref: "Cohort", index: true }
  },
  { timestamps: true }
);

export const Session = mongoose.model("Session", sessionSchema);
