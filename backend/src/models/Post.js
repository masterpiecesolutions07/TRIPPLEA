import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    coverImage: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    body: { type: String, default: "" },
    category: {
      type: String,
      enum: ["journey", "success_story", "market_insight", "announcement"],
      default: "announcement",
      index: true
    },
    tags: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    studentName: { type: String, default: "" },
    consent: { type: Boolean, default: false },
    status: { type: String, enum: ["draft", "pending_review", "published"], default: "draft", index: true },
    publishedAt: { type: Date },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
