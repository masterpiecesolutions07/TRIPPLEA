import { useEffect, useState } from "react";
import { createRecord, getCollection, getMyStories, setStoryPublished, submitStory } from "../../api/dashboardApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { SaveAlert } from "../../components/SaveAlert.jsx";
import { feedbackMessage } from "../../utils/feedback.js";

const KINDS = [
  ["success_story", "Success story"],
  ["progress", "Progress update"],
  ["feedback", "Feedback about the programme"]
];

const LEVELS = [
  ["beginner", "Beginner"],
  ["intermediate", "Intermediate"],
  ["advanced", "Advanced"]
];

const EMPTY = { studentName: "", level: "beginner", kind: "success_story", body: "" };

function labelFor(list, value) {
  return list.find(([item]) => item === value)?.[1] || value || "";
}

export function SuccessStories({ review = false }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ ...EMPTY, studentName: review ? "" : (user?.name || "") });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  function load() {
    const request = review ? getCollection("posts") : getMyStories();
    request.then(setItems).catch((err) => setError(feedbackMessage(err, "Could not load the success stories. Please try again.")));
  }

  useEffect(() => { load(); }, [review]);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaved("");
    try {
      if (review) await createRecord("posts", form);
      else await submitStory(form);
      setForm({ ...EMPTY, studentName: review ? "" : (user?.name || "") });
      setSaved(review ? "Saved. It stays hidden until you choose to show it." : "Sent. A mentor will read it before it can appear on the site.");
      load();
    } catch (err) {
      setError(feedbackMessage(err, "Could not save this story. Please try again."));
    }
  }

  async function publish(id, published) {
    setError("");
    setSaved("");
    try {
      await setStoryPublished(id, published);
      setSaved(published ? "Showing on the site." : "Hidden from the site.");
      load();
    } catch (err) {
      setError(feedbackMessage(err, "Could not update this story. Please try again."));
    }
  }

  return (
    <>
      <div className="panel">
        <h2>What this is</h2>
        <p>A success story is the student’s own words about the programme. It can be a success story, a progress update, or feedback. Write the paragraph in English or Somali.</p>
        <p className="note">It is not a profit claim. A mentor or an admin reviews every story and chooses whether to publish it.</p>
      </div>
      <form className="panel dash-form" onSubmit={submit}>
        <h2>Write a success story</h2>
        {error ? <p className="form-summary">{error}</p> : null}
        <SaveAlert message={saved} />
        <div className="field"><label htmlFor="story-name">Student name</label><input id="story-name" name="studentName" required value={form.studentName} onChange={update} /></div>
        <div className="field">
          <label htmlFor="story-level">Level</label>
          <select id="story-level" name="level" value={form.level} onChange={update}>
            {LEVELS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="story-kind">Type</label>
          <select id="story-kind" name="kind" value={form.kind} onChange={update}>
            {KINDS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="story-body">Story</label>
          <textarea id="story-body" name="body" required value={form.body} onChange={update} placeholder="Write one paragraph in English or Somali" />
        </div>
        <button className="btn btn--primary" type="submit">Save story</button>
      </form>
      {items.length === 0 ? <div className="panel"><p className="note">No success stories yet.</p></div> : items.map((item) => (
        <article className="panel story-card" key={item._id}>
          <h2>{item.studentName || item.title}</h2>
          <p className="note">
            {[
              labelFor(LEVELS, item.level),
              labelFor(KINDS, item.category === "journey" ? "success_story" : item.category),
              item.status === "published" ? "Showing on the site" : "Waiting for review"
            ].filter(Boolean).join(" · ")}
          </p>
          <p>{item.body}</p>
          {review ? (
            <div className="cluster">
              {item.status === "published" ? (
                <button className="btn btn--ghost" type="button" onClick={() => publish(item._id, false)}>Hide from the site</button>
              ) : (
                <button className="btn btn--primary" type="button" onClick={() => publish(item._id, true)}>Show on the site</button>
              )}
            </div>
          ) : null}
        </article>
      ))}
    </>
  );
}
