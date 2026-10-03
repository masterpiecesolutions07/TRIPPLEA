import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    instrument: { type: String, required: true },
    direction: { type: String, enum: ["buy", "sell"], required: true },
    session: { type: String, default: "" },
    timeframe: { type: String, default: "" },
    entry: { type: String, default: "" },
    stopLoss: { type: String, default: "" },
    takeProfit: { type: String, default: "" },
    riskReward: { type: String, default: "" },
    setupType: { type: String, default: "" },
    notes: { type: String, default: "" },
    images: [{ url: String, publicId: String }],
    status: {
      type: String,
      enum: ["live", "closed_win", "closed_loss", "break_even"],
      default: "live",
      index: true
    },
    result: { type: String, default: "" },
    postedAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    published: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Trade = mongoose.model("Trade", tradeSchema);
