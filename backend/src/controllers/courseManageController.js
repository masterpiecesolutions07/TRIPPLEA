import mongoose from "mongoose";
import { AuditLog } from "../models/AuditLog.js";
import { Course } from "../models/Course.js";
import { Enrollment } from "../models/Enrollment.js";
import { Lesson } from "../models/Lesson.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { Module as CourseModule } from "../models/Module.js";
import { Phase } from "../models/Phase.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { saveImage } from "../utils/saveImage.js";
import { parseVideoLink, safeCover, safeResource } from "../utils/videoLink.js";

const MISSING = "That part of the course is no longer here.";

function slugify(value) {
  const base = String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return (base || "lesson").slice(0, 70);
}

function copyTitle(title, max) {
  const suffix = " copy";
  if (title.length + suffix.length <= max) return `${title}${suffix}`;
  return `${title.slice(0, max - suffix.length).trimEnd()}${suffix}`;
}

async function audit(req, action, entity, entityId) {
  await AuditLog.create({ actor: req.user._id, action, entity, entityId: String(entityId || ""), meta: {} });
}

async function courseOrThrow() {
  const course = await Course.findOne().sort({ createdAt: 1 });
  if (!course) throw new ApiError(404, "The course outline is not here yet.");
  return course;
}

async function phaseOrThrow(course, id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, MISSING);
  const phase = await Phase.findOne({ _id: id, course: course._id });
  if (!phase) throw new ApiError(404, MISSING);
  return phase;
}

async function moduleOrThrow(course, id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, MISSING);
  const phaseIds = await Phase.find({ course: course._id }).distinct("_id");
  const item = await CourseModule.findOne({ _id: id, phase: { $in: phaseIds } });
  if (!item) throw new ApiError(404, MISSING);
  return item;
}

async function lessonOrThrow(course, id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, MISSING);
  const phaseIds = await Phase.find({ course: course._id }).distinct("_id");
  const moduleIds = await CourseModule.find({ phase: { $in: phaseIds } }).distinct("_id");
  const item = await Lesson.findOne({ _id: id, module: { $in: moduleIds } });
  if (!item) throw new ApiError(404, MISSING);
  return item;
}

async function uniqueSlug(title) {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (n < 40) {
    const found = await Lesson.exists({ slug });
    if (!found) return slug;
    slug = `${base}-${n}`.slice(0, 80);
    n += 1;
  }
  throw new ApiError(400, "Choose a different lesson title.");
}

async function nextOrder(Model, filter) {
  const latest = await Model.findOne(filter).sort({ order: -1 }).select("order");
  return (latest?.order || 0) + 1;
}

function presentLesson(lesson) {
  return {
    _id: lesson._id,
    title: lesson.title,
    slug: lesson.slug,
    description: lesson.description,
    videoUrl: lesson.videoUrl,
    embedUrl: lesson.embedUrl,
    resources: lesson.resources,
    durationMinutes: lesson.durationMinutes,
    order: lesson.order,
    status: lesson.status,
    freePreview: lesson.freePreview
  };
}

async function treeFor(course) {
  const phases = await Phase.find({ course: course._id }).sort({ order: 1, createdAt: 1 });
  const modules = await CourseModule.find({ phase: { $in: phases.map((item) => item._id) } }).sort({ order: 1, createdAt: 1 });
  const lessons = await Lesson.find({ module: { $in: modules.map((item) => item._id) } }).sort({ order: 1, createdAt: 1 });
  const lessonsByModule = new Map();
  for (const lesson of lessons) {
    const key = String(lesson.module);
    lessonsByModule.set(key, [...(lessonsByModule.get(key) || []), presentLesson(lesson)]);
  }
  const modulesByPhase = new Map();
  for (const item of modules) {
    const key = String(item.phase);
    const row = {
      _id: item._id,
      title: item.title,
      description: item.description,
      cover: item.cover,
      track: item.track,
      order: item.order,
      status: item.status,
      videoUrl: item.videoUrl || "",
      embedUrl: item.embedUrl || "",
      lessons: lessonsByModule.get(String(item._id)) || []
    };
    modulesByPhase.set(key, [...(modulesByPhase.get(key) || []), row]);
  }
  return {
    course: {
      _id: course._id,
      title: course.title,
      description: course.description,
      unlockMode: course.unlockMode,
      status: course.status,
      createdAt: course.createdAt
    },
    phases: phases.map((phase) => ({
      _id: phase._id,
      title: phase.title,
      description: phase.description,
      cover: phase.cover,
      order: phase.order,
      status: phase.status,
      modules: modulesByPhase.get(String(phase._id)) || []
    }))
  };
}

async function respond(res, course, message, focusId = "") {
  res.json({ message, focusId: focusId ? String(focusId) : "", ...(await treeFor(course)) });
}

function lessonFields(body) {
  const video = parseVideoLink(body.videoUrl || "");
  return {
    title: body.title,
    description: body.description || "",
    videoUrl: video.videoUrl,
    embedUrl: video.embedUrl,
    resources: (body.resources || []).map(safeResource),
    durationMinutes: body.durationMinutes,
    status: body.status,
    freePreview: body.freePreview
  };
}

function wantsPermanent(req) {
  if (req.query.permanent !== "1") return false;
  if (req.user.role !== "admin") throw new ApiError(403, "Only an admin can remove this for good.");
  return true;
}

async function compact(Model, filter) {
  const rows = await Model.find(filter).sort({ order: 1, createdAt: 1 });
  for (const [index, row] of rows.entries()) {
    if (row.order !== index + 1) {
      row.order = index + 1;
      await row.save();
    }
  }
}

async function sameSet(expectedIds, orderedIds) {
  const left = expectedIds.map(String).sort();
  const right = [...orderedIds].sort();
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

export const getManagedCourse = asyncHandler(async (_req, res) => {
  res.json(await treeFor(await courseOrThrow()));
});

export const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseOrThrow();
  course.title = req.body.title;
  course.description = req.body.description || "";
  course.unlockMode = req.body.unlockMode;
  course.status = req.body.status;
  await course.save();
  await audit(req, "course.update", "Course", course._id);
  await respond(res, course, "Saved.");
});

export const uploadCourseFile = asyncHandler(async (req, res) => {
  const url = await saveImage(req.body.image, "course");
  res.status(201).json({ url });
});

export const createPhase = asyncHandler(async (req, res) => {
  const course = await courseOrThrow();
  const phase = await Phase.create({
    course: course._id,
    title: req.body.title,
    description: req.body.description || "",
    cover: safeCover(req.body.coverUrl),
    order: await nextOrder(Phase, { course: course._id }),
    status: req.body.status
  });
  await audit(req, "course.phase.create", "Phase", phase._id);
  await respond(res, course, "Phase added.", phase._id);
});

export const updatePhase = asyncHandler(async (req, res) => {
  const course = await courseOrThrow();
  const phase = await phaseOrThrow(course, req.params.id);
  phase.title = req.body.title;
  phase.description = req.body.description || "";
  phase.status = req.body.status;
  if (req.body.coverUrl !== undefined) phase.cover = safeCover(req.body.coverUrl);
  await phase.save();
  await audit(req, "course.phase.update", "Phase", phase._id);
  await respond(res, course, "Saved.");
});

export const duplicatePhase = asyncHandler(async (req, res) => {
  const course = await courseOrThrow();
  const source = await phaseOrThrow(course, req.params.id);
  const modules = await CourseModule.find({ phase: source._id }).sort({ order: 1 });
  const created = { phase: null, modules: [], lessons: [] };
  try {
    created.phase = await Phase.create({
      course: course._id,
      title: copyTitle(source.title, 120),
      description: source.description,
      cover: source.cover,
      order: await nextOrder(Phase, { course: course._id }),
      status: "draft"
    });
    for (const item of modules) {
      const copy = await CourseModule.create({
        phase: created.phase._id,
        title: item.title,
        description: item.description,
        cover: item.cover,
        track: item.track,
        order: item.order,
        status: "draft"
      });
      created.modules.push(copy._id);
      const lessons = await Lesson.find({ module: item._id }).sort({ order: 1 });
      for (const lesson of lessons) {
        const saved = await Lesson.create({
          module: copy._id,
          title: lesson.title,
          slug: await uniqueSlug(lesson.title),
          description: lesson.description,
          videoUrl: lesson.videoUrl,
          embedUrl: lesson.embedUrl,
          resources: lesson.resources,
          durationMinutes: lesson.durationMinutes,
          order: lesson.order,
          status: "draft",
          freePreview: lesson.freePreview
        });
        created.lessons.push(saved._id);
      }
    }
  } catch (error) {
    await Lesson.deleteMany({ _id: { $in: created.lessons } });
    await CourseModule.deleteMany({ _id: { $in: created.modules } });
    if (created.phase) await Phase.deleteOne({ _id: created.phase._id });
    throw error;
  }
  await audit(req, "course.phase.duplicate", "Phase", created.phase._id);
  await respond(res, course, "Copied. The copy is a draft.", created.phase._id);
});

async function removePhase(course, phase) {
  const modules = await CourseModule.find({ phase: phase._id }).select("_id");
  const moduleIds = modules.map((item) => item._id);
  const lessons = await Lesson.find({ module: { $in: moduleIds } }).select("_id");
  const lessonIds = lessons.map((item) => item._id);
  await LessonProgress.deleteMany({ lesson: { $in: lessonIds } });
  await Lesson.deleteMany({ _id: { $in: lessonIds } });
  await CourseModule.deleteMany({ _id: { $in: moduleIds } });
  await Phase.deleteOne({ _id: phase._id });
  await Enrollment.updateMany({ course: course._id }, { $pull: { unlockedPhases: phase._id, unlockedModules: { $in: moduleIds } } });
  await compact(Phase, { course: course._id });
}

export const deletePhase = asyncHandler(async (req, res) => {
  const course = await courseOrThrow();
  const phase = await phaseOrThrow(course, req.params.id);
  if (!wantsPermanent(req)) {
    phase.status = "hidden";
    await phase.save();
    await audit(req, "course.phase.hide", "Phase", phase._id);
    await respond(res, course, "Hidden from students.");
    return;
  }
  await removePhase(course, phase);
  await audit(req, "course.phase.delete", "Phase", phase._id);
  await respond(res, course, "Removed.");
});

export const createModule = asyncHandler(async (req, res) => {
  const course = await courseOrThrow();
  const phase = await phaseOrThrow(course, req.body.phaseId);
  const item = await CourseModule.create({
    phase: phase._id,
    title: req.body.title,
    description: req.body.description || "",
    cover: safeCover(req.body.coverUrl),
    track: req.body.track,
    order: await nextOrder(CourseModule, { phase: phase._id }),
    status: req.body.status
  });
  await audit(req, "course.module.create", "Module", item._id);
  await respond(res, course, "Module added.", item._id);
});

export const updateModule = asyncHandler(async (req, res) => {
  const course = await courseOrThrow();
  const item = await moduleOrThrow(course, req.params.id);
  item.title = req.body.title;
  item.description = req.body.description || "";
  item.track = req.body.track;
  item.status = req.body.status;
  if (req.body.coverUrl !== undefined) item.cover = safeCover(req.body.coverUrl);
  if (req.body.videoUrl !== undefined) {
    const video = parseVideoLink(req.body.videoUrl || "");
    item.videoUrl = video.videoUrl;
    item.embedUrl = video.embedUrl;
    const first = await Lesson.findOne({ module: item._id }).sort({ order: 1 });
    if (first) {
      first.title = item.title;
      first.videoUrl = video.videoUrl;
      first.embedUrl = video.embedUrl;
      if (/placeholder description/i.test(first.description || "")) first.description = "";
      await first.save();
    }
  }
  await item.save();
  await audit(req, "course.module.update", "Module", item._id);
  await respond(res, course, "Saved.");
});

export const duplicateModule = asyncHandler(async (req, res) => {
  const course = await courseOrThrow();
  const source = await moduleOrThrow(course, req.params.id);
  const lessons = await Lesson.find({ module: source._id }).sort({ order: 1 });
  const createdLessons = [];
  const copy = await CourseModule.create({
    phase: source.phase,
    title: copyTitle(source.title, 160),
    description: source.description,
    cover: source.cover,
    track: source.track,
    order: await nextOrder(CourseModule, { phase: source.phase }),
    status: "draft"
  });
  try {
    for (const lesson of lessons) {
      const saved = await Lesson.create({
        module: copy._id,
        title: lesson.title,
        slug: await uniqueSlug(lesson.title),
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        embedUrl: lesson.embedUrl,
        resources: lesson.resources,
        durationMinutes: lesson.durationMinutes,
        order: lesson.order,
        status: "draft",
        freePreview: lesson.freePreview
      });
      createdLessons.push(saved._id);
    }
  } catch (error) {
    await Lesson.deleteMany({ _id: { $in: createdLessons } });
    await CourseModule.deleteOne({ _id: copy._id });
    throw error;
  }
  await audit(req, "course.module.duplicate", "Module", copy._id);
  await respond(res, course, "Copied. The copy is a draft.", copy._id);
});

async function removeModule(item) {
  const lessons = await Lesson.find({ module: item._id }).select("_id");
  const lessonIds = lessons.map((lesson) => lesson._id);
  await LessonProgress.deleteMany({ lesson: { $in: lessonIds } });
  await Lesson.deleteMany({ _id: { $in: lessonIds } });
  await CourseModule.deleteOne({ _id: item._id });
  await Enrollment.updateMany({}, { $pull: { unlockedModules: item._id } });
  await compact(CourseModule, { phase: item.phase });
}

export const deleteModule = asyncHandler(async (req, res) => {
  const course = await courseOrThrow();
  const item = await moduleOrThrow(course, req.params.id);
  if (!wantsPermanent(req)) {
    item.status = "hidden";
    await item.save();
    await audit(req, "course.module.hide", "Module", item._id);
    await respond(res, course, "Hidden from students.");
    return;
  }
  await removeModule(item);
  await audit(req, "course.module.delete", "Module", item._id);
  await respond(res, course, "Removed.");
});

export const createLesson = asyncHandler(async (req, res) => {
  const course = await courseOrThrow();
  const parent = await moduleOrThrow(course, req.body.moduleId);
  const lesson = await Lesson.create({
    module: parent._id,
    slug: await uniqueSlug(req.body.title),
    order: await nextOrder(Lesson, { module: parent._id }),
    ...lessonFields(req.body)
  });
  await audit(req, "course.lesson.create", "Lesson", lesson._id);
  await respond(res, course, "Lesson added.", lesson._id);
});

export const updateLesson = asyncHandler(async (req, res) => {
  const course = await courseOrThrow();
  const lesson = await lessonOrThrow(course, req.params.id);
  Object.assign(lesson, lessonFields(req.body));
  await lesson.save();
  await audit(req, "course.lesson.update", "Lesson", lesson._id);
  await respond(res, course, "Saved.");
});

export const duplicateLesson = asyncHandler(async (req, res) => {
  const course = await courseOrThrow();
  const source = await lessonOrThrow(course, req.params.id);
  const lesson = await Lesson.create({
    module: source.module,
    title: copyTitle(source.title, 160),
    slug: await uniqueSlug(`${source.title} copy`),
    description: source.description,
    videoUrl: source.videoUrl,
    embedUrl: source.embedUrl,
    resources: source.resources,
    durationMinutes: source.durationMinutes,
    order: await nextOrder(Lesson, { module: source.module }),
    status: "draft",
    freePreview: source.freePreview
  });
  await audit(req, "course.lesson.duplicate", "Lesson", lesson._id);
  await respond(res, course, "Copied. The copy is a draft.", lesson._id);
});

export const deleteLesson = asyncHandler(async (req, res) => {
  const course = await courseOrThrow();
  const lesson = await lessonOrThrow(course, req.params.id);
  if (!wantsPermanent(req)) {
    lesson.status = "hidden";
    await lesson.save();
    await audit(req, "course.lesson.hide", "Lesson", lesson._id);
    await respond(res, course, "Hidden from students.");
    return;
  }
  const moduleId = lesson.module;
  await LessonProgress.deleteMany({ lesson: lesson._id });
  await Lesson.deleteOne({ _id: lesson._id });
  await compact(Lesson, { module: moduleId });
  await audit(req, "course.lesson.delete", "Lesson", lesson._id);
  await respond(res, course, "Removed.");
});

export const reorderCourse = asyncHandler(async (req, res) => {
  const course = await courseOrThrow();
  const { kind, parentId, orderedIds } = req.body;
  if (new Set(orderedIds).size !== orderedIds.length) throw new ApiError(400, "Refresh the page and try the order again.");

  if (kind === "phase") {
    const rows = await Phase.find({ course: course._id }).select("_id");
    if (!(await sameSet(rows.map((row) => row._id), orderedIds))) throw new ApiError(400, "Refresh the page and try the order again.");
    for (const [index, id] of orderedIds.entries()) await Phase.updateOne({ _id: id, course: course._id }, { order: index + 1 });
  } else if (kind === "module") {
    const phase = await phaseOrThrow(course, parentId);
    const rows = await CourseModule.find({ phase: phase._id }).select("_id");
    if (!(await sameSet(rows.map((row) => row._id), orderedIds))) throw new ApiError(400, "Refresh the page and try the order again.");
    for (const [index, id] of orderedIds.entries()) await CourseModule.updateOne({ _id: id, phase: phase._id }, { order: index + 1 });
  } else {
    const parent = await moduleOrThrow(course, parentId);
    const rows = await Lesson.find({ module: parent._id }).select("_id");
    if (!(await sameSet(rows.map((row) => row._id), orderedIds))) throw new ApiError(400, "Refresh the page and try the order again.");
    for (const [index, id] of orderedIds.entries()) await Lesson.updateOne({ _id: id, module: parent._id }, { order: index + 1 });
  }

  await audit(req, "course.reorder", "Course", course._id);
  await respond(res, course, "Order saved.");
});
