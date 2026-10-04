import { z } from "zod";

const day = z.union([
  z.literal(""),
  z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "Choose an end date." })
]);
const statusField = z.enum(["active", "inactive", "removed"], { error: "Choose open, paused, or ended." });
const reasonField = z.string().trim().max(500, "Use a shorter note.").optional().or(z.literal(""));

export const openEnrollmentSchema = z.object({
  applicationId: z.string().trim().min(1, "Choose an application."),
  cohortId: z.string().trim().optional().or(z.literal(""))
});

export const enrollmentStatusSchema = z.object({
  status: statusField,
  reason: reasonField
});

export const enrollmentAccessSchema = z.object({
  accessUntil: day.optional(),
  unlockedPhases: z.array(z.string().trim()).max(40, "Refresh the page and try again.").optional(),
  unlockedModules: z.array(z.string().trim()).max(80, "Refresh the page and try again.").optional()
});

export const bulkEnrollmentSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1, "Choose at least one student.").max(100, "Choose up to 100 students."),
  status: statusField.optional(),
  reason: reasonField,
  accessUntil: day.optional()
});

export const cohortAccessSchema = z.object({
  cohortId: z.string().trim().min(1, "Choose a group."),
  accessUntil: day
});
