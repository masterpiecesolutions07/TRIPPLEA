import { z } from "zod";

export const statusSchema = z.object({
  status: z.enum(["pending", "under_review", "approved", "rejected", "waitlisted"])
});

export const cohortSchema = z.object({
  name: z.string().trim().min(2).max(80),
  startDate: z.string().min(8),
  mode: z.enum(["online", "physical", "both"]),
  seatLimit: z.number().int().min(1).max(500).optional(),
  priceFrom: z.number().min(0).optional(),
  zoom: z.string().trim().max(300).optional(),
  meet: z.string().trim().max(300).optional(),
  venue: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(1000).optional(),
  publishAlert: z.boolean().optional()
});

export const mentorshipApplicationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().min(8, "Enter a phone number.").max(22),
  country: z.string().trim().min(2, "Enter your country.").max(60),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  mode: z.enum(["online", "physical"]),
  plan: z.enum(["starter", "premium", "custom"]),
  goals: z.string().trim().min(8, "Say what you want from the three months.").max(1000),
  whyJoin: z.string().trim().min(8, "Say why you want to join.").max(1000),
  availability: z.string().trim().max(300).optional().or(z.literal("")),
  heard: z.string().trim().min(2, "Tell us how you heard about Tripple A.").max(40),
  cohortId: z.string().trim().optional().or(z.literal("")),
  consent: z.boolean().refine((value) => value === true, "Accept the terms and the risk disclaimer.")
});

export const storySchema = z.object({
  title: z.string().trim().min(4).max(120),
  body: z.string().trim().min(20).max(8000),
  consent: z.boolean().refine((value) => value === true, "Consent is required before a story can be saved.")
});

export const roleSchema = z.object({
  role: z.enum(["student", "mentor", "admin"])
});

export const mentorAccountSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).regex(/[a-z]/).regex(/[A-Z]/).regex(/\d/)
});

export const settingsSchema = z.object({
  email: z.string().trim().max(120).optional(),
  phoneDisplay: z.string().trim().max(40).optional(),
  whatsappNumber: z.string().trim().max(22).optional(),
  location: z.string().trim().max(160).optional(),
  tiktok: z.string().trim().max(300).optional(),
  facebook: z.string().trim().max(300).optional(),
  youtube: z.string().trim().max(300).optional(),
  discord: z.string().trim().max(300).optional(),
  instagram: z.string().trim().max(300).optional(),
  strategyCredit: z.string().trim().min(8).max(240).optional()
});

export const faqsSchema = z.object({
  items: z.array(z.object({
    id: z.string().trim().min(1).max(40),
    question: z.string().trim().min(4).max(200),
    answer: z.string().trim().min(8).max(2000)
  })).max(40)
});
