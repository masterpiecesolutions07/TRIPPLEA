import { ContactMessage } from "../models/ContactMessage.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createMessage = asyncHandler(async (req, res) => {
  await ContactMessage.create({
    name: req.body.name.trim(),
    email: req.body.email.toLowerCase(),
    phone: req.body.phone || "",
    subject: req.body.subject,
    message: req.body.message.trim()
  });
  res.status(201).json({ message: "Message received." });
});
