import { useEffect, useState } from "react";
import {
  getManagedCourse,
  saveCourseItem,
  saveCourseSettings,
  uploadCourseFile
} from "../../api/dashboardApi.js";
import { ImageUpload } from "../../components/ImageUpload.jsx";
import { CourseCatalog } from "../../components/course/CourseCatalog.jsx";
import { courseBlurb, CourseSummaryCard } from "../../components/course/CourseSummaryCard.jsx";
import { DayPlayer } from "../../components/course/DayPlayer.jsx";
import { SaveAlert } from "../../components/SaveAlert.jsx";
import { PROGRAMME_WEEKS } from "../../data/programmeLength.js";
import { feedbackMessage } from "../../utils/feedback.js";

const TRACKS = {
  core: "Core",
  risk: "Risk management",
  psychology: "Trading psychology",
  development: "Personal development"
};

function OutlineForm({ kind, initial, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    status: initial?.status || "draft",
    track: initial?.track || "core",
    coverUrl: initial?.cover?.url || ""
  });

  async function addCover(image) {
    const url = await uploadCourseFile(image);
    setForm((current) => ({ ...current, coverUrl: url }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      track: form.track,
      coverUrl: form.coverUrl
    });
  }

  return (
    <form className="dash-form course-editor" onSubmit={submit}>
      <div className="field">
        <label htmlFor="outline-title">Title</label>
        <input id="outline-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
      </div>
      <div className="field">
        <label htmlFor="outline-description">Description</label>
        <textarea id="outline-description" rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
      </div>
      {kind === "module" ? (
        <div className="field">
          <label htmlFor="outline-track">Track</label>
          <select id="outline-track" value={form.track} onChange={(event) => setForm({ ...form, track: event.target.value })}>
            {Object.entries(TRACKS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      ) : null}
      <div className="field">
        <label htmlFor="outline-status">Status</label>
        <select id="outline-status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
          <option value="draft">Draft</option>
          <option value="published">Showing</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>
      {form.coverUrl ? <img className="course-cover" src={form.coverUrl} alt="" /> : null}
      <ImageUpload label={form.coverUrl ? "Replace cover" : "Add a cover"} showPreview={false} onFile={addCover} />
      {form.coverUrl ? <button className="btn btn--ghost btn--small" type="button" onClick={() => setForm({ ...form, coverUrl: "" })}>Remove cover</button> : null}
      <div className="cluster">
        <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
        <button className="btn btn--ghost" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

export function ManageCourse() {
  const [tree, setTree] = useState(null);
  const [courseForm, setCourseForm] = useState(null);
  const [phaseId, setPhaseId] = useState("");
  const [dayId, setDayId] = useState("");
  const [open, setOpen] = useState(false);
  const [editor, setEditor] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getManagedCourse()
      .then((data) => {
        setTree(data);
        setCourseForm({
          title: data.course.title,
          description: data.course.description,
          unlockMode: data.course.unlockMode,
          status: data.course.status
        });
      })
      .catch((err) => setError(feedbackMessage(err, "Could not load the course. Please try again.")));
  }, []);

  useEffect(() => {
    if (!tree) return;
    setPhaseId((current) => (current && tree.phases.some((phase) => phase._id === current) ? current : ""));
  }, [tree]);

  function applyResult(data, preferredPhase) {
    setTree(data);
    setSaved(data.message || "Saved.");
    setError("");
    const match = [preferredPhase, data.focusId].find((id) => (data.phases || []).some((phase) => phase._id === id));
    const createdDay = (data.phases || []).flatMap((phase) => phase.modules).find((item) => item._id === data.focusId);
    if (match) setPhaseId(match);
    if (createdDay) setDayId(createdDay._id);
  }

  async function run(work) {
    setBusy(true);
    setError("");
    setSaved("");
    try {
      return await work();
    } catch (err) {
      setError(feedbackMessage(err, "Could not save that change. Please try again."));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function saveCourse(event) {
    event.preventDefault();
    const data = await run(() => saveCourseSettings({
      ...courseForm,
      title: courseForm.title.trim(),
      description: courseForm.description.trim()
    }));
    if (!data) return;
    setTree(data);
    setCourseForm({
      title: data.course.title,
      description: data.course.description,
      unlockMode: data.course.unlockMode,
      status: data.course.status
    });
    setSaved(data.message || "Saved.");
  }

  async function saveDay(item, fields) {
    const description = /placeholder description/i.test(item.description || "") ? "" : (item.description || "");
    const data = await run(() => saveCourseItem("modules", item._id, {
      title: fields.title,
      description,
      status: item.status || "draft",
      track: item.track || "core",
      coverUrl: item.cover?.url || "",
      videoUrl: fields.videoUrl
    }));
    if (!data) return;
    setTree(data);
    setSaved("Saved.");
  }

  async function submitEditor(fields) {
    if (!editor) return;
    const body = editor.kind === "lessons"
      ? { ...fields, ...(editor.id ? {} : { moduleId: editor.parentId }) }
      : {
          title: fields.title,
          description: fields.description,
          status: fields.status,
          coverUrl: fields.coverUrl || "",
          ...(editor.kind === "modules" ? { track: fields.track, ...(editor.id ? {} : { phaseId: editor.parentId }) } : {})
        };
    const data = await run(() => saveCourseItem(editor.kind, editor.id, body));
    if (!data) return;
    applyResult(data, editor.parentId);
    setEditor(null);
  }

  if (!tree || !courseForm) return <p>{error || "Loading the course…"}</p>;

  const playing = tree.phases.find((phase) => phase._id === phaseId) || null;
  const activeDay = playing?.modules.find((item) => item._id === dayId)?._id || playing?.modules[0]?._id || "";

  return (
    <>
      {error ? <p className="form-summary">{error}</p> : null}
      <SaveAlert message={saved} />
      {playing ? (
        <>
          <DayPlayer
            phase={playing}
            dayId={activeDay}
            canEdit
            busy={busy}
            onBack={() => { setPhaseId(""); setDayId(""); }}
            onSelect={setDayId}
            onSave={saveDay}
          />
          <div className="course-head">
            <button className="btn btn--ghost" type="button" disabled={busy} onClick={() => setEditor({ kind: "modules", id: null, parentId: playing._id, item: null })}>Add a day</button>
          </div>
          {editor?.kind === "modules" && !editor.id && editor.parentId === playing._id ? (
            <OutlineForm kind="module" onSubmit={submitEditor} onCancel={() => setEditor(null)} busy={busy} />
          ) : null}
        </>
      ) : open ? (
        <>
          <button className="back-link" type="button" onClick={() => setOpen(false)}>Back to the course</button>
          <CourseCatalog
            heading="Your course"
            cards={tree.phases.map((phase) => ({
              id: phase._id,
              title: phase.title,
              coverTitle: phase.title,
              cover: phase.cover?.url || "",
              onStart: () => { setPhaseId(phase._id); setDayId(phase.modules[0]?._id || ""); }
            }))}
          />
          <div className="course-head">
            <button className="btn btn--ghost" type="button" disabled={busy} onClick={() => setEditor({ kind: "phases", id: null, parentId: null, item: null })}>Add a phase</button>
          </div>
          {editor?.kind === "phases" && !editor.id ? (
            <OutlineForm kind="phase" onSubmit={submitEditor} onCancel={() => setEditor(null)} busy={busy} />
          ) : null}
        </>
      ) : (
        <>
          <div className="course-page-head">
            <h1>My courses</h1>
            <p className="note">The mentorship course.</p>
          </div>
          <CourseSummaryCard
            title={tree.course.title}
            subtitle="By Tripple A"
            description={courseBlurb(tree.course.description)}
            countLabel={`${PROGRAMME_WEEKS} weeks`}
            assignedAt={tree.course.createdAt}
            assignedLabel="Opened:"
            onView={() => setOpen(true)}
          />
          <details className="panel course-settings">
            <summary>Course settings</summary>
            <form className="dash-form" onSubmit={saveCourse}>
              <div className="field">
                <label htmlFor="course-title">Title</label>
                <input id="course-title" value={courseForm.title} onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })} required />
              </div>
              <div className="field">
                <label htmlFor="course-description">Description</label>
                <textarea id="course-description" rows={3} value={courseForm.description} onChange={(event) => setCourseForm({ ...courseForm, description: event.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="course-unlock">How phases open</label>
                <select id="course-unlock" value={courseForm.unlockMode} onChange={(event) => setCourseForm({ ...courseForm, unlockMode: event.target.value })}>
                  <option value="sequential">One phase at a time</option>
                  <option value="open">All published phases open</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="course-status">Status</label>
                <select id="course-status" value={courseForm.status} onChange={(event) => setCourseForm({ ...courseForm, status: event.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="published">Showing</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
              <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save course"}</button>
            </form>
          </details>
        </>
      )}
    </>
  );
}
