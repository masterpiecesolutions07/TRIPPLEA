import { z } from "zod";

const password = z
  .string()
  .min(8, "Use at least 8 characters.")
  .regex(/[a-z]/, "Include both upper-case and lower-case letters.")
  .regex(/[A-Z]/, "Include both upper-case and lower-case letters.")
  .regex(/\d/, "Include at least one number.");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(80, "Use a shorter name."),
  email: z.string().trim().email("Enter a valid email address."),
  password
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: password
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  remember: z.boolean().optional()
});
