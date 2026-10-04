import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    lastPosition: { type: Number, default: 0 },
    notes: { type: String, default: "", maxlength: 4000 }
  },
  { timestamps: true }
);

lessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });
lessonProgressSchema.index({ user: 1, completed: 1 });

export const LessonProgress = mongoose.model("LessonProgress", lessonProgressSchema);
