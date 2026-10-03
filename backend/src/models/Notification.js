import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    audience: { type: String, enum: ["user", "students", "cohort"], default: "user" },
    cohort: { type: mongoose.Schema.Types.ObjectId, ref: "Cohort" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "info" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
