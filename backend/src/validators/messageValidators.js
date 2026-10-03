import { z } from "zod";

export const messageSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().max(22).optional().or(z.literal("")),
  subject: z.string().trim().min(2, "Choose a subject.").max(80),
  message: z.string().trim().min(8, "Write a short message.").max(2000)
});
