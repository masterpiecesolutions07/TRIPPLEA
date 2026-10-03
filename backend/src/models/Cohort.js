import mongoose from "mongoose";

const cohortSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["draft", "open", "full", "closed", "in_progress", "completed", "cancelled"],
      default: "draft",
      index: true
    },
    mode: { type: String, enum: ["online", "physical", "both"], default: "both" },
    seatLimit: { type: Number, default: 20 },
    seatsTaken: { type: Number, default: 0 },
    priceFrom: { type: Number, default: 120 },
    sessionLinks: {
      zoom: { type: String, default: "" },
      meet: { type: String, default: "" }
    },
    venue: { type: String, default: "" },
    applicationOpenAt: { type: Date },
    applicationDeadline: { type: Date },
    notes: { type: String, default: "" },
    alertId: { type: mongoose.Schema.Types.ObjectId, ref: "Alert" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const Cohort = mongoose.model("Cohort", cohortSchema);
