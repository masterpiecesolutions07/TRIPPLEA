import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "site", unique: true },
    email: { type: String, default: "" },
    phoneDisplay: { type: String, default: "" },
    phoneTel: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    location: { type: String, default: "Online, and in person with the cohort" },
    socials: {
      tiktok: { type: String, default: "https://www.tiktok.com/@tripple.a75" },
      facebook: { type: String, default: "" },
      youtube: { type: String, default: "" },
      discord: { type: String, default: "" },
      instagram: { type: String, default: "" }
    },
    stats: {
      months: { type: Number, default: 3 },
      weeks: { type: Number, default: 12 },
      attendanceModes: { type: Number, default: 2 },
      priceFrom: { type: Number, default: 120 }
    },
    strategyCredit: {
      type: String,
      default: "Strategy compiled by Grand Mentor Abdiwali Moalimuu."
    },
    brand: { type: String, default: "Tripple A" },
    mentorName: { type: String, default: "Abdullahi Abukar Ahmed" }
  },
  { timestamps: true }
);

export const Settings = mongoose.model("Settings", settingsSchema);
