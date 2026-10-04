import { Course } from "../src/models/Course.js";
import { Lesson } from "../src/models/Lesson.js";
import { Module } from "../src/models/Module.js";
import { Phase } from "../src/models/Phase.js";
import { COURSE_OUTLINE } from "./courseOutline.js";

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "lesson";
}

export async function seedCourse() {
  const existing = await Course.findOne();
  if (existing) {
    console.log("Course already exists. Skipped.");
    return;
  }

  const course = await Course.create({
    title: COURSE_OUTLINE.title,
    description: COURSE_OUTLINE.description,
    unlockMode: "sequential",
    status: "draft"
  });
  const phaseIds = [];
  const moduleIds = [];
  const slugs = new Set();

  try {
    for (const [phaseIndex, phase] of COURSE_OUTLINE.phases.entries()) {
      const savedPhase = await Phase.create({
        course: course._id,
        title: phase.title,
        description: phase.description,
        order: phaseIndex + 1,
        status: "draft"
      });
      phaseIds.push(savedPhase._id);

      for (const [moduleIndex, item] of phase.modules.entries()) {
        const savedModule = await Module.create({
          phase: savedPhase._id,
          title: item.title,
          description: item.description,
          track: item.track,
          order: moduleIndex + 1,
          status: "draft"
        });
        moduleIds.push(savedModule._id);

        for (const [lessonIndex, title] of item.lessons.entries()) {
          const slug = slugify(title);
          if (slugs.has(slug)) throw new Error(`Duplicate lesson title: ${title}`);
          slugs.add(slug);
          await Lesson.create({
            module: savedModule._id,
            title,
            slug,
            description: "Placeholder description. The mentor will replace this before publishing.",
            videoUrl: "",
            embedUrl: "",
            order: lessonIndex + 1,
            status: "draft",
            freePreview: false
          });
        }
      }
    }
  } catch (error) {
    await Lesson.deleteMany({ module: { $in: moduleIds } });
    await Module.deleteMany({ _id: { $in: moduleIds } });
    await Phase.deleteMany({ _id: { $in: phaseIds } });
    await Course.deleteOne({ _id: course._id });
    throw error;
  }

  const lessons = slugs.size;
  console.log(`Course outline ready: ${phaseIds.length} phases, ${moduleIds.length} modules, ${lessons} lessons. All drafts, no videos.`);
}
