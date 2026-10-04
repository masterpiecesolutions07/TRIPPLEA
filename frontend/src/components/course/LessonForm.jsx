import { useState } from "react";
import { uploadCourseFile } from "../../api/dashboardApi.js";
import { ImageUpload } from "../ImageUpload.jsx";
import { describeVideo } from "../../utils/videoEmbed.js";
import { VideoEmbed } from "./VideoEmbed.jsx";

const EMPTY = {
  title: "",
  description: "",
  videoUrl: "",
  durationMinutes: 0,
  status: "draft",
  freePreview: false,
  resources: []
};

export function LessonForm({ initial, onSubmit, onCancel, busy }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial, resources: initial?.resources ? initial.resources.map((item) => ({ ...item })) : [] });
  const [localError, setLocalError] = useState("");
  const preview = describeVideo(form.videoUrl);
  const showInvalid = form.videoUrl.trim().length > 12 && preview.state === "invalid";

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function changeResource(index, field, value) {
    setForm((current) => ({
      ...current,
      resources: current.resources.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    }));
  }

  async function addPhoto(image) {
    if (form.resources.length >= 8) {
      setLocalError("Add up to 8 files or links.");
      return;
    }
    const url = await uploadCourseFile(image);
    setForm((current) => ({
      ...current,
      resources: [...current.resources, { title: "Photo", kind: "file", url }]
    }));
  }

  function submit(event) {
    event.preventDefault();
    setLocalError("");
    if (preview.state === "invalid") {
      setLocalError(preview.message);
      return;
    }
    const resources = form.resources.map((item) => ({
      title: item.title.trim(),
      kind: item.kind,
      url: item.url.trim()
    }));
    if (resources.some((item) => item.title.length < 2 || !item.url)) {
      setLocalError("Name each file or link.");
      return;
    }
    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      videoUrl: form.videoUrl.trim(),
      durationMinutes: Math.max(0, Math.round(Number(form.durationMinutes) || 0)),
      resources
    });
  }

  return (
    <form className="dash-form course-editor" onSubmit={submit}>
      {localError ? <p className="form-summary">{localError}</p> : null}
      <div className="field">
        <label htmlFor="lesson-title">Title</label>
        <input id="lesson-title" value={form.title} onChange={(event) => setField("title", event.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="lesson-description">Short description</label>
        <textarea id="lesson-description" rows={3} value={form.description} onChange={(event) => setField("description", event.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="lesson-video">Video link</label>
        <input id="lesson-video" value={form.videoUrl} onChange={(event) => setField("videoUrl", event.target.value)} placeholder="YouTube, Vimeo, Google Drive, or Cloudinary" />
        <p className="note">Keep the video unlisted or limited to this site. A student who can open it can still share the link.</p>
        {showInvalid ? <p className="form-summary">{preview.message}</p> : null}
        {preview.state === "ready" ? (
          <>
            <p className="note">{preview.label} preview</p>
            <VideoEmbed url={form.videoUrl} title={form.title} />
          </>
        ) : null}
      </div>
      <div className="field">
        <label htmlFor="lesson-length">Length in minutes</label>
        <input id="lesson-length" type="number" min="0" max="600" value={form.durationMinutes} onChange={(event) => setField("durationMinutes", event.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="lesson-status">Status</label>
        <select id="lesson-status" value={form.status} onChange={(event) => setField("status", event.target.value)}>
          <option value="draft">Draft</option>
          <option value="published">Showing</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>
      <label className="check">
        <input type="checkbox" checked={form.freePreview} onChange={(event) => setField("freePreview", event.target.checked)} />
        <span>Let an enrolled student open this lesson before the earlier phases. It does not skip acceptance into a group.</span>
      </label>
      <div className="course-resources">
        <p className="note">Files and links stay inside the lesson. They are not shown on the public site.</p>
        {form.resources.map((item, index) => (
          <div className="course-resource" key={`${item.kind}-${index}`}>
            <div className="field">
              <label htmlFor={`resource-title-${index}`}>Name</label>
              <input id={`resource-title-${index}`} value={item.title} onChange={(event) => changeResource(index, "title", event.target.value)} />
            </div>
            {item.kind === "link" ? (
              <div className="field">
                <label htmlFor={`resource-url-${index}`}>Link</label>
                <input id={`resource-url-${index}`} value={item.url} onChange={(event) => changeResource(index, "url", event.target.value)} placeholder="https://" />
              </div>
            ) : (
              <img src={item.url} alt="" />
            )}
            <button className="btn btn--ghost btn--small" type="button" onClick={() => setField("resources", form.resources.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
          </div>
        ))}
        <div className="cluster">
          <button
            className="btn btn--ghost btn--small"
            type="button"
            disabled={form.resources.length >= 8}
            onClick={() => setField("resources", [...form.resources, { title: "", kind: "link", url: "" }])}
          >
            Add a link
          </button>
          <ImageUpload label="Add a photo" showPreview={false} onFile={addPhoto} />
        </div>
      </div>
      <div className="cluster">
        <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save lesson"}</button>
        <button className="btn btn--ghost" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
