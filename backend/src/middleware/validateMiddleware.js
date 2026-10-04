import { ApiError } from "../utils/ApiError.js";

const TECHNICAL = /too (small|big)|invalid (input|option|enum|value)|expected |received /i;

const FIELD_HINTS = {
  email: "Enter a valid email address.",
  name: "Enter your name.",
  fullName: "Enter your name.",
  password: "Check the password and try again.",
  newPassword: "Check the new password and try again.",
  currentPassword: "Enter your current password.",
  phone: "Enter a phone number.",
  message: "Write a short message.",
  subject: "Choose a subject.",
  goals: "Say what you want from the three months.",
  whyJoin: "Say why you want to join.",
  consent: "Accept the terms and the risk disclaimer.",
  experience: "Choose beginner, intermediate, or advanced.",
  plan: "Choose a price plan.",
  mode: "Choose online or in person.",
  heard: "Tell us how you heard about Tripple A.",
  country: "Enter your country.",
  image: "Choose a photo and try again.",
  body: "Write a longer paragraph.",
  studentName: "Enter the student name.",
  level: "Choose beginner, intermediate, or advanced.",
  kind: "Choose a success story, a progress update, or feedback.",
  title: "Enter a title.",
  description: "Use a shorter description.",
  videoUrl: "Use a YouTube, Vimeo, Google Drive, or Cloudinary video link.",
  durationMinutes: "Enter the length in minutes.",
  unlockMode: "Choose how phases open.",
  coverUrl: "Choose a JPG or PNG photo.",
  track: "Choose a track.",
  freePreview: "Choose whether this lesson can open early.",
  status: "Choose draft, showing, or hidden.",
  orderedIds: "Refresh the page and try the order again.",
  phaseId: "Choose a phase.",
  moduleId: "Choose a module.",
  accessUntil: "Choose an end date.",
  cohortId: "Choose a group.",
  applicationId: "Choose an application.",
  ids: "Choose at least one student.",
  applicationIds: "Choose at least one approved student.",
  startsAt: "Choose a date and time.",
  platform: "Choose Zoom, Google Meet, or a room.",
  link: "Use a full https link.",
  venue: "Use a shorter venue note.",
  read: "Choose read or unread.",
  reason: "Use a shorter note.",
  unlockedPhases: "Refresh the page and try again.",
  unlockedModules: "Refresh the page and try again."
};

function plainIssue(issue) {
  const message = issue?.message || "";
  if (message && !TECHNICAL.test(message)) return message;
  const key = String(issue?.path?.at(-1) || "");
  return FIELD_HINTS[key] || "Check the form and try again.";
}

export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ApiError(400, plainIssue(result.error.issues[0])));
      return;
    }
    req.body = result.data;
    next();
  };
}
