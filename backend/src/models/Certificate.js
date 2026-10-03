import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, enum: ["passed_account", "withdrawal", "milestone", "other"], required: true, index: true },
    studentDisplayName: { type: String, default: "" },
    consent: { type: Boolean, required: true },
    date: { type: Date },
    amount: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { url: { type: String, default: "" }, publicId: { type: String, default: "" } },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const Certificate = mongoose.model("Certificate", certificateSchema);
