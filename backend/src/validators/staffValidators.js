import { z } from "zod";

export const statusSchema = z.object({
  status: z.enum(["pending", "under_review", "approved", "rejected", "waitlisted"])
});

export const accountStatusSchema = z.object({
  isActive: z.boolean()
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

export const cohortStudentsSchema = z.object({
  applicationIds: z.array(z.string().trim().min(1)).min(1).max(100)
});

export const sessionSchema = z.object({
  title: z.string().trim().min(2).max(120),
  startsAt: z.string().min(8),
  mode: z.enum(["online", "physical"]),
  platform: z.enum(["zoom", "meet", "room"]),
  link: z.string().trim().max(300).optional().or(z.literal("")),
  venue: z.string().trim().max(200).optional().or(z.literal("")),
  cohortId: z.string().trim().optional().or(z.literal(""))
});

export const mentorshipApplicationSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name.").max(80, "Use a shorter name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(8, "Enter a phone number.").max(22, "Use a shorter phone number."),
  country: z.string().trim().min(2, "Enter your country.").max(60, "Use a shorter country name."),
  city: z.string().trim().max(80, "Use a shorter city name.").optional().or(z.literal("")),
  experience: z.enum(["beginner", "intermediate", "advanced"], { error: "Choose beginner, intermediate, or advanced." }),
  mode: z.enum(["online", "physical"], { error: "Choose online or in person." }),
  plan: z.enum(["starter", "premium", "custom"], { error: "Choose a price plan." }),
  goals: z.string().trim().max(1000, "Use a shorter answer.").optional().or(z.literal("")),
  whyJoin: z.string().trim().max(1000, "Use a shorter answer.").optional().or(z.literal("")),
  availability: z.string().trim().max(300, "Use a shorter answer.").optional().or(z.literal("")),
  heard: z.string().trim().min(2, "Tell us how you heard about Tripple A.").max(40, "Use a shorter answer."),
  cohortId: z.string().trim().optional().or(z.literal("")),
  consent: z.boolean().refine((value) => value === true, "Accept the terms and the risk disclaimer.")
});

export const storySchema = z.object({
  studentName: z.string().trim().min(2, "Enter the student name.").max(80, "Use a shorter name."),
  level: z.enum(["beginner", "intermediate", "advanced"], { error: "Choose beginner, intermediate, or advanced." }),
  kind: z.enum(["success_story", "progress", "feedback"], { error: "Choose a success story, a progress update, or feedback." }),
  body: z.string().trim().min(20, "Write a longer paragraph.").max(4000, "Use a shorter paragraph.")
});

export const storyPublishSchema = z.object({
  published: z.boolean()
});

export const imageSchema = z.object({
  image: z.string().min(30).max(2_900_000)
});

export const alertSchema = z.object({
  title: z.string().trim().min(2).max(120),
  message: z.string().trim().min(4).max(500),
  type: z.enum(["info", "success", "warning", "urgent", "cohort"]),
  link: z.string().trim().max(300).optional().or(z.literal(""))
});

export const messageSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  subject: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(4).max(2000)
});

export const messageStatusSchema = z.object({
  status: z.enum(["new", "read", "archived"])
});

export const applicationUpdateSchema = z.object({
  status: z.enum(["pending", "under_review", "approved", "rejected", "waitlisted"]).optional(),
  plan: z.enum(["starter", "premium", "custom"]).optional(),
  mode: z.enum(["online", "physical"]).optional(),
  phone: z.string().trim().max(22).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal(""))
});

export const paymentAlertSchema = z.object({
  message: z.string().trim().min(8).max(500)
});

export const notificationReadSchema = z.object({
  read: z.boolean()
});

export const avatarSchema = z.object({
  image: z.string().min(30).max(2_900_000)
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(22).optional().or(z.literal("")),
  country: z.string().trim().max(60).optional().or(z.literal(""))
});

export const studentUpdateSchema = z.object({
  phone: z.string().trim().max(22).optional().or(z.literal("")),
  country: z.string().trim().max(60).optional().or(z.literal(""))
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
