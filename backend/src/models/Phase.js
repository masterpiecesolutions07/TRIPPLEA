import mongoose from "mongoose";

const phaseSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 2000 },
    cover: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" }
    },
    order: { type: Number, required: true },
    status: { type: String, enum: ["draft", "published", "hidden"], default: "draft", index: true }
  },
  { timestamps: true }
);

phaseSchema.index({ course: 1, order: 1 });

export const Phase = mongoose.model("Phase", phaseSchema);
