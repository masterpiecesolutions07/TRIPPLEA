import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications, getStudentHome, getStudentSessions, submitStory } from "../../api/dashboardApi.js";
import { useAuth } from "../../context/AuthContext.jsx";

export function StudentHome() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    getStudentHome().then(setData).catch((err) => setError(err.response?.data?.message || "Could not load your dashboard."));
  }, []);
  return (
    <>
      <h1>Your mentorship</h1>
      {error ? <p className="form-summary">{error}</p> : null}
      <div className="panel">
        <p className="lede">Signed in as {data?.user?.name || "…"}. Progress appears here after you are enrolled in a cohort.</p>
        {data?.application ? (
          <p>Your application is <strong>{data.application.status.replaceAll("_", " ")}</strong>{data.application.plan ? ` · ${data.application.plan}` : ""}.</p>
        ) : <p><Link to="/apply">Apply for the mentorship</Link></p>}
        {data?.progress?.length ? data.progress.map((item) => (
          <p key={item._id}>{item.cohort?.name || "Cohort"} · {item.level} · {item.percentage}%</p>
        )) : <p className="note">No module progress yet.</p>}
      </div>
    </>
  );
}

export function StudentProgress() {
  const [data, setData] = useState(null);
  useEffect(() => { getStudentHome().then(setData).catch(() => setData({ progress: [] })); }, []);
  const modules = data?.progress?.flatMap((item) => item.modules || []) || [];
  return (
    <>
      <h1>Progress</h1>
      {modules.length === 0 ? <p className="note">Your mentor has not opened modules yet.</p> : (
        <div className="dash-grid">
          {modules.map((item) => (
            <article className="panel" key={item.key}><h2>{item.title}</h2><p className="note">{item.status}</p></article>
          ))}
        </div>
      )}
    </>
  );
}

export function StudentSessions() {
  const [items, setItems] = useState([]);
  useEffect(() => { getStudentSessions().then(setItems).catch(() => setItems([])); }, []);
  return (
    <>
      <h1>Sessions</h1>
      {items.length === 0 ? <p className="note">No sessions are on your cohort yet.</p> : (
        <div className="dash-grid">
          {items.map((item) => (
            <article className="panel" key={item._id}>
              <h2>{item.title}</h2>
              <p className="note">{new Date(item.startsAt).toLocaleString("en-GB")} · {item.mode} · {item.platform}</p>
              {item.link ? <p><a href={item.link}>Join</a></p> : null}
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export function StudentNotifications() {
  const [items, setItems] = useState([]);
  useEffect(() => { getNotifications().then(setItems).catch(() => setItems([])); }, []);
  return (
    <>
      <h1>Notifications</h1>
      {items.length === 0 ? <p className="note">No notifications yet.</p> : items.map((item) => (
        <article className="panel" key={item._id} style={{ marginBottom: "0.7rem" }}>
          <h2>{item.title}</h2>
          <p className="note">{item.message}</p>
        </article>
      ))}
    </>
  );
}

export function Profile() {
  const { user } = useAuth();
  return (
    <>
      <h1>Profile</h1>
      <div className="panel">
        <p><strong>{user?.name}</strong></p>
        <p className="note">{user?.email}</p>
        <p className="note">{user?.phone} {user?.country}</p>
        <p className="note">Role: {user?.role}</p>
        <p><a href="/change-password">Change password</a></p>
      </div>
    </>
  );
}

export function SubmitStory() {
  const [form, setForm] = useState({ title: "", body: "", consent: false });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function update(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await submitStory(form);
      setMessage("Your draft is with the mentor for review.");
      setForm({ title: "", body: "", consent: false });
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the story.");
    }
  }

  return (
    <>
      <h1>Submit my story</h1>
      <form className="panel dash-form" onSubmit={submit}>
        {error ? <p className="form-summary">{error}</p> : null}
        {message ? <p className="note">{message}</p> : null}
        <div className="field"><label htmlFor="story-title">Title</label><input id="story-title" name="title" required value={form.title} onChange={update} /></div>
        <div className="field"><label htmlFor="story-body">Story</label><textarea id="story-body" name="body" required value={form.body} onChange={update} /></div>
        <label className="check"><input type="checkbox" name="consent" checked={form.consent} onChange={update} /> I agree this story can be reviewed and, if published, shown with my name.</label>
        <button className="btn btn--primary" type="submit">Send draft</button>
      </form>
    </>
  );
}
