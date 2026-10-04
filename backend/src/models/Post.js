import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    coverImage: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    body: { type: String, default: "" },
    category: {
      type: String,
      enum: ["journey", "success_story", "progress", "feedback", "market_insight", "announcement"],
      default: "success_story",
      index: true
    },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    tags: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    studentName: { type: String, default: "" },
    period: { type: String, enum: ["weeks_1_4", "weeks_5_8", "weeks_9_12", "whole"], default: "whole" },
    practised: { type: String, default: "" },
    changed: { type: String, default: "" },
    consent: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "pending_review", "published"], default: "draft", index: true },
    publishedAt: { type: Date },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
