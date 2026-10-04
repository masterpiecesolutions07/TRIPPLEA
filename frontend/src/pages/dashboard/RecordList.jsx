import { useEffect, useState } from "react";
import { createRecord, getCollection, updateMessageStatus } from "../../api/dashboardApi.js";
import { ImageUpload } from "../../components/ImageUpload.jsx";
import { SaveAlert } from "../../components/SaveAlert.jsx";
import { feedbackMessage } from "../../utils/feedback.js";
import { SuccessStories } from "./SuccessStories.jsx";

const ALERT = { title: "", message: "", type: "info", link: "" };
const MESSAGE = { name: "", email: "", subject: "", message: "" };

function shotSrc(resource, item) {
  if (resource === "trades") return item.images?.[0]?.url || "";
  return item.image?.url || "";
}

function ImageBoard({ resource, empty, note }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  function load() {
    getCollection(resource).then(setItems).catch((err) => setError(feedbackMessage(err, "Could not load these photos. Please try again.")));
  }

  useEffect(() => { load(); }, [resource]);

  async function upload(image) {
    setError("");
    setSaved("");
    await createRecord(resource, { image });
    setSaved("Photo saved.");
    load();
  }

  const shots = items.filter((item) => shotSrc(resource, item));
  return (
    <>
      <p className="note">{note}</p>
      <div className="panel image-upload-panel">
        <ImageUpload label="Upload image" onFile={upload} />
      </div>
      {error ? <p className="form-summary">{error}</p> : null}
      <SaveAlert message={saved} />
      {shots.length === 0 ? <div className="panel"><p className="note">{empty}</p></div> : (
        <div className="shot-grid">
          {shots.map((item) => <img key={item._id} src={shotSrc(resource, item)} alt="" />)}
        </div>
      )}
    </>
  );
}

function SimpleForm({ resource, title, note, initial, children }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  function load() {
    getCollection(resource).then(setItems).catch((err) => setError(feedbackMessage(err, "Could not load this list. Please try again.")));
  }

  useEffect(() => { load(); }, [resource]);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaved("");
    try {
      await createRecord(resource, form);
      setForm(initial);
      setSaved("Saved.");
      load();
    } catch (err) {
      setError(feedbackMessage(err, "Could not save this. Please try again."));
    }
  }

  async function markMessage(id, status) {
    setSaved("");
    try {
      await updateMessageStatus(id, status);
      setSaved("Message saved.");
      load();
    } catch (err) {
      setError(feedbackMessage(err, "Could not update this message. Please try again."));
    }
  }

  return (
    <>
      <form className="panel dash-form" onSubmit={submit}>
        <h2>{title}</h2>
        <p className="note">{note}</p>
        {error ? <p className="form-summary">{error}</p> : null}
        <SaveAlert message={saved} />
        {children(form, update)}
        <button className="btn btn--primary" type="submit">Save</button>
      </form>
      {resource === "messages" ? <MessageTable items={items} onStatus={markMessage} /> : <AlertTable items={items} />}
    </>
  );
}

function AlertTable({ items }) {
  if (!items.length) return <div className="panel"><p className="note">No alerts yet.</p></div>;
  return (
    <div className="table-wrap panel">
      <table className="dash-table">
        <thead><tr><th>Title</th><th>Type</th><th>Active</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id}><td>{item.title}</td><td>{item.type}</td><td>{String(item.isActive)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MessageTable({ items, onStatus }) {
  if (!items.length) return <div className="panel"><p className="note">No messages yet.</p></div>;
  return (
    <div className="table-wrap panel">
      <table className="dash-table">
        <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Status</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.email}</td>
              <td>{item.subject}</td>
              <td>
                <select aria-label={`Status for ${item.name}`} value={item.status} onChange={(event) => onStatus(item._id, event.target.value)}>
                  {["new", "read", "archived"].map((option) => <option key={option}>{option}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RecordList({ title, resource, empty }) {
  return (
    <>
      <h1>{title}</h1>
      {resource === "certificates" ? (
        <ImageBoard resource="certificates" empty={empty} note="Upload the image only. Cover account numbers and other personal details first. The picture is what visitors see." />
      ) : null}
      {resource === "trades" ? (
        <ImageBoard resource="trades" empty={empty} note="Upload the chart image only. It is for teaching. It is not a result and it is not a promise of profit." />
      ) : null}
      {resource === "posts" ? <SuccessStories review /> : null}
      {resource === "alerts" ? (
        <SimpleForm resource="alerts" title="New alert" note="Active alerts can be shown to visitors." initial={ALERT}>
          {(form, update) => (
            <>
              <div className="field"><label htmlFor="alert-title">Title</label><input id="alert-title" name="title" required value={form.title} onChange={update} /></div>
              <div className="field"><label htmlFor="alert-message">Message</label><textarea id="alert-message" name="message" required value={form.message} onChange={update} /></div>
              <div className="field">
                <label htmlFor="alert-type">Type</label>
                <select id="alert-type" name="type" value={form.type} onChange={update}>
                  {["info", "success", "warning", "urgent", "cohort"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div className="field"><label htmlFor="alert-link">Link</label><input id="alert-link" name="link" value={form.link} onChange={update} /></div>
            </>
          )}
        </SimpleForm>
      ) : null}
      {resource === "messages" ? (
        <SimpleForm resource="messages" title="Record a message" note="Messages from the contact form appear here. You can also record one by hand." initial={MESSAGE}>
          {(form, update) => (
            <>
              <div className="field"><label htmlFor="msg-name">Name</label><input id="msg-name" name="name" required value={form.name} onChange={update} /></div>
              <div className="field"><label htmlFor="msg-email">Email</label><input id="msg-email" name="email" type="email" required value={form.email} onChange={update} /></div>
              <div className="field"><label htmlFor="msg-subject">Subject</label><input id="msg-subject" name="subject" value={form.subject} onChange={update} /></div>
              <div className="field"><label htmlFor="msg-body">Message</label><textarea id="msg-body" name="message" required value={form.message} onChange={update} /></div>
            </>
          )}
        </SimpleForm>
      ) : null}
    </>
  );
}
