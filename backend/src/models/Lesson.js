import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    kind: { type: String, enum: ["file", "link"], default: "link" },
    url: { type: String, required: true, trim: true, maxlength: 500 }
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "", maxlength: 2000 },
    videoUrl: { type: String, default: "", maxlength: 500 },
    embedUrl: { type: String, default: "", maxlength: 500 },
    resources: { type: [resourceSchema], default: [] },
    durationMinutes: { type: Number, default: 0 },
    order: { type: Number, required: true },
    status: { type: String, enum: ["draft", "published", "hidden"], default: "draft", index: true },
    freePreview: { type: Boolean, default: false }
  },
  { timestamps: true }
);

lessonSchema.index({ module: 1, order: 1 });

export const Lesson = mongoose.model("Lesson", lessonSchema);
