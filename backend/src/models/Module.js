import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    phase: { type: mongoose.Schema.Types.ObjectId, ref: "Phase", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: "", maxlength: 2000 },
    cover: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" }
    },
    track: { type: String, enum: ["core", "risk", "psychology", "development"], default: "core" },
    videoUrl: { type: String, default: "", maxlength: 500 },
    embedUrl: { type: String, default: "", maxlength: 500 },
    order: { type: Number, required: true },
    status: { type: String, enum: ["draft", "published", "hidden"], default: "draft", index: true }
  },
  { timestamps: true }
);

moduleSchema.index({ phase: 1, order: 1 });

export const Module = mongoose.model("Module", moduleSchema);
