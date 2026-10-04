import { useEffect, useState } from "react";
import { createSession, getCollection, getSessions, removeSession } from "../../api/dashboardApi.js";
import { SaveAlert } from "../../components/SaveAlert.jsx";
import { feedbackMessage } from "../../utils/feedback.js";

const EMPTY = { title: "", startsAt: "", mode: "online", platform: "zoom", link: "", venue: "", cohortId: "" };
const MODE = { online: "Online", physical: "In person" };
const PLATFORM = { zoom: "Zoom", meet: "Google Meet", room: "Room" };

export function Sessions() {
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  function load() {
    getSessions().then(setItems).catch((err) => setError(feedbackMessage(err, "Could not load the sessions. Please try again.")));
    getCollection("cohorts").then((rows) => {
      setGroups(rows);
      setForm((current) => ({ ...current, cohortId: current.cohortId || rows[0]?._id || "" }));
    }).catch(() => setGroups([]));
  }

  useEffect(() => { load(); }, []);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "mode") next.platform = value === "physical" ? "room" : "zoom";
      return next;
    });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaved("");
    try {
      await createSession({
        ...form,
        startsAt: new Date(form.startsAt).toISOString()
      });
      setForm((current) => ({ ...EMPTY, cohortId: current.cohortId }));
      setSaved("Session saved.");
      load();
    } catch (err) {
      setError(feedbackMessage(err, "Could not save the session. Please try again."));
    }
  }

  async function remove(item) {
    if (!window.confirm(`Remove ${item.title}?`)) return;
    setError("");
    setSaved("");
    try {
      const message = await removeSession(item._id);
      setSaved(message || "Session removed.");
      load();
    } catch (err) {
      setError(feedbackMessage(err, "Could not remove that session. Please try again."));
    }
  }

  return (
    <>
      <h1>Sessions</h1>
      <form className="panel dash-form" onSubmit={submit}>
        <h2>New session</h2>
        <p className="note">Students whose course is open see this on their Sessions page. A group name is optional. Use a real Zoom, Meet, or venue note, and leave the link blank until you have one.</p>
        {error ? <p className="form-summary">{error}</p> : null}
        <SaveAlert message={saved} />
            <div className="field"><label htmlFor="session-title">Title</label><input id="session-title" name="title" required value={form.title} onChange={update} /></div>
            <div className="field"><label htmlFor="session-when">Date and time</label><input id="session-when" name="startsAt" type="datetime-local" required value={form.startsAt} onChange={update} /></div>
            <div className="field">
              <label htmlFor="session-group">Group</label>
              <select id="session-group" name="cohortId" value={form.cohortId} onChange={update}>
                <option value="">All students with the course open</option>
                {groups.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="session-mode">Mode</label>
              <select id="session-mode" name="mode" value={form.mode} onChange={update}>
                <option value="online">Online</option>
                <option value="physical">In person</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="session-platform">Where</label>
              <select id="session-platform" name="platform" value={form.platform} onChange={update}>
                <option value="zoom">Zoom</option>
                <option value="meet">Google Meet</option>
                <option value="room">Room</option>
              </select>
            </div>
            <div className="field"><label htmlFor="session-link">Join link</label><input id="session-link" name="link" value={form.link} onChange={update} placeholder="https://" /></div>
            <div className="field"><label htmlFor="session-venue">Venue note</label><input id="session-venue" name="venue" value={form.venue} onChange={update} /></div>
            <button className="btn btn--primary" type="submit">Save session</button>
      </form>
      {items.length === 0 ? <p className="note">No sessions yet.</p> : (
        <div className="dash-grid session-board">
          {items.map((item) => (
            <article className="panel" key={item._id}>
              <h2>{item.title}</h2>
              <p className="note">{new Date(item.startsAt).toLocaleString("en-GB")}</p>
              <p className="note">{item.cohort?.name || "All students"} · {MODE[item.mode] || item.mode} · {PLATFORM[item.platform] || item.platform}</p>
              {item.venue ? <p>{item.venue}</p> : null}
              {item.link ? <p><a href={item.link}>Open link</a></p> : null}
              <button className="btn btn--ghost btn--small" type="button" onClick={() => remove(item)}>Remove</button>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
