import mongoose from "mongoose";
import { Course } from "../models/Course.js";
import { Lesson } from "../models/Lesson.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { Module as CourseModule } from "../models/Module.js";
import { Phase } from "../models/Phase.js";
import { courseAccessFor } from "../middleware/courseAccess.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function outlineFor(userId) {
  const course = await Course.findOne().sort({ createdAt: 1 });
  if (!course) return { course: null, phases: [] };
  const phases = await Phase.find({ course: course._id, status: { $ne: "hidden" } }).sort({ order: 1 });
  const modules = await CourseModule.find({ phase: { $in: phases.map((item) => item._id) }, status: { $ne: "hidden" } }).sort({ order: 1 });
  const lessons = await Lesson.find({ module: { $in: modules.map((item) => item._id) }, status: { $ne: "hidden" } })
    .sort({ order: 1 })
    .select("title description durationMinutes module videoUrl embedUrl");
  const progress = await LessonProgress.find({ user: userId, lesson: { $in: lessons.map((item) => item._id) } }).select("lesson completed");
  const done = new Set(progress.filter((item) => item.completed).map((item) => String(item.lesson)));
  let continueLessonId = "";
  const phaseRows = phases.map((phase) => ({
    _id: phase._id,
    title: phase.title,
    description: phase.description,
    cover: phase.cover,
    modules: modules.filter((item) => String(item.phase) === String(phase._id)).map((item) => {
      const dayLessons = lessons.filter((lesson) => String(lesson.module) === String(item._id));
      const watch = dayLessons.find((lesson) => lesson.embedUrl) || dayLessons[0];
      return {
      _id: item._id,
      title: item.title,
      videoUrl: item.videoUrl || watch?.videoUrl || "",
      embedUrl: item.embedUrl || watch?.embedUrl || "",
      watchLessonId: watch ? String(watch._id) : "",
      completed: watch ? done.has(String(watch._id)) : false,
      lessons: dayLessons.map((lesson) => {
        const completed = done.has(String(lesson._id));
        if (!continueLessonId && !completed) continueLessonId = String(lesson._id);
        return {
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          durationMinutes: lesson.durationMinutes,
          completed
        };
      })
      };
    })
  }));
  return {
    course: { title: course.title, description: course.description, continueLessonId },
    phases: phaseRows
  };
}

async function openLesson(id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, "That class is no longer here.");
  const lesson = await Lesson.findById(id);
  if (!lesson || lesson.status === "hidden") throw new ApiError(404, "That class is no longer here.");
  const parent = await CourseModule.findById(lesson.module).select("phase status");
  if (!parent || parent.status === "hidden") throw new ApiError(404, "That class is no longer here.");
  const phase = await Phase.findById(parent.phase).select("status");
  if (!phase || phase.status === "hidden") throw new ApiError(404, "That class is no longer here.");
  return lesson;
}

export const getCourseGate = asyncHandler(async (req, res) => {
  if (req.user.role !== "student") throw new ApiError(403, "This course is for students.");
  const access = await courseAccessFor(req.user);
  if (access.access !== "active") {
    res.json({ access: access.access, message: access.message, course: null, phases: [] });
    return;
  }
  const outline = await outlineFor(req.user._id);
  if (outline.course) outline.course.openedAt = access.enrollment?.activatedAt || null;
  res.json({ access: "active", message: access.message, ...outline });
});

export const getLesson = asyncHandler(async (req, res) => {
  const lesson = await openLesson(req.params.id);
  const progress = await LessonProgress.findOne({ user: req.user._id, lesson: lesson._id });
  res.json({
    lesson: {
      _id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      embedUrl: lesson.embedUrl,
      resources: lesson.resources,
      durationMinutes: lesson.durationMinutes,
      completed: Boolean(progress?.completed),
      notes: progress?.notes || ""
    }
  });
});

export const completeLesson = asyncHandler(async (req, res) => {
  const lesson = await openLesson(req.params.id);
  const progress = await LessonProgress.findOneAndUpdate(
    { user: req.user._id, lesson: lesson._id },
    { completed: true, completedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ message: "Marked as finished.", completed: progress.completed });
});

export const saveLessonNotes = asyncHandler(async (req, res) => {
  const lesson = await openLesson(req.params.id);
  const progress = await LessonProgress.findOneAndUpdate(
    { user: req.user._id, lesson: lesson._id },
    { notes: req.body.notes },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ message: "Note saved.", notes: progress.notes });
});
