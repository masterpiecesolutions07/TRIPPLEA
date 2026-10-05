import { z } from "zod";

const statusField = z.enum(["draft", "published", "hidden"], { error: "Choose draft, showing, or hidden." });

const text = (max, emptyHint) => z.string().trim().max(max, emptyHint || "Use a shorter description.");

export const courseSettingsSchema = z.object({
  title: z.string().trim().min(2, "Enter a title.").max(120, "Use a shorter title."),
  description: text(2000, "Use a shorter description."),
  unlockMode: z.enum(["sequential", "open"], { error: "Choose how phases open." }),
  status: statusField
});

export const phaseSchema = z.object({
  title: z.string().trim().min(2, "Enter a title.").max(120, "Use a shorter title."),
  description: text(2000),
  status: statusField,
  coverUrl: z.string().trim().max(500, "Choose a JPG or PNG photo.").optional().or(z.literal(""))
});

export const moduleSchema = phaseSchema.extend({
  phaseId: z.string().trim().min(1, "Choose a phase."),
  title: z.string().trim().min(2, "Enter a title.").max(160, "Use a shorter title."),
  track: z.enum(["core", "risk", "psychology", "development"], { error: "Choose a track." })
});

export const moduleUpdateSchema = moduleSchema.omit({ phaseId: true }).extend({
  videoUrl: z.string().trim().max(500, "That video link is too long.").optional().or(z.literal(""))
});

const resourceSchema = z.object({
  title: z.string().trim().min(2, "Name each file or link.").max(160, "Use a shorter name."),
  kind: z.enum(["file", "link"], { error: "Choose a file or a link." }),
  url: z.string().trim().min(1, "Add the file or link.").max(500, "That link is too long.")
});

export const lessonSchema = z.object({
  moduleId: z.string().trim().min(1, "Choose a module."),
  title: z.string().trim().min(2, "Enter a title.").max(160, "Use a shorter title."),
  description: text(2000),
  videoUrl: z.string().trim().max(500, "That video link is too long.").optional().or(z.literal("")),
  durationMinutes: z.number().int().min(0).max(600),
  status: statusField,
  freePreview: z.boolean(),
  resources: z.array(resourceSchema).max(8, "Add up to 8 files or links.")
});

export const lessonUpdateSchema = lessonSchema.omit({ moduleId: true });

export const reorderSchema = z.object({
  kind: z.enum(["phase", "module", "lesson"], { error: "Refresh the page and try the order again." }),
  parentId: z.string().trim().max(40).optional().or(z.literal("")),
  orderedIds: z.array(z.string().trim().min(1)).min(1, "Refresh the page and try the order again.").max(200, "Refresh the page and try the order again.")
});

export const lessonNotesSchema = z.object({
  notes: z.string().max(4000, "Use a shorter note.")
});
