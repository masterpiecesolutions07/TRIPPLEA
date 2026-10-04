import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 2000 },
    unlockMode: { type: String, enum: ["sequential", "open"], default: "sequential" },
    status: { type: String, enum: ["draft", "published", "hidden"], default: "draft", index: true }
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
