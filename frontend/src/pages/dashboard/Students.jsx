import { useEffect, useState } from "react";
import { getCollection, sendPaymentAlert, updateApplication, updateStudent } from "../../api/dashboardApi.js";
import { SaveAlert } from "../../components/SaveAlert.jsx";
import { feedbackMessage } from "../../utils/feedback.js";

const PAYMENT = "Please arrange payment for your mentorship. Plans start from 120 USD. This site does not take the payment.";

export function Actions({ application, onDone }) {
  const [plan, setPlan] = useState(application.plan || "starter");
  const [mode, setMode] = useState(application.mode || "online");
  const [notes, setNotes] = useState(application.notes || "");
  const [phone, setPhone] = useState(application.phone || "");
  const [alert, setAlert] = useState(PAYMENT);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  async function save(status) {
    setError("");
    setSaved("");
    try {
      await updateApplication(application.id || application._id, { plan, mode, notes, phone, ...(status ? { status } : {}) });
      setSaved(status ? `Saved as ${status.replaceAll("_", " ")}.` : "Application saved.");
      onDone();
    } catch (err) {
      setError(feedbackMessage(err, "Could not save the application. Please try again."));
    }
  }

  async function pay() {
    setError("");
    setSaved("");
    try {
      setSaved(await sendPaymentAlert(application.id || application._id, alert));
    } catch (err) {
      setError(feedbackMessage(err, "Could not send that note. Please try again."));
    }
  }

  return (
    <div className="dash-form" style={{ display: "grid", gap: "0.6rem" }}>
      {error ? <p className="form-summary">{error}</p> : null}
      <SaveAlert message={saved} />
      <div className="field"><label>Phone</label><input value={phone} onChange={(event) => setPhone(event.target.value)} /></div>
      <div className="field">
        <label>Plan</label>
        <select value={plan} onChange={(event) => setPlan(event.target.value)}>
          <option value="starter">Starter</option>
          <option value="premium">Premium</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      <div className="field">
        <label>Attendance</label>
        <select value={mode} onChange={(event) => setMode(event.target.value)}>
          <option value="online">Online</option>
          <option value="physical">In person</option>
        </select>
      </div>
      <div className="field"><label>Notes</label><textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></div>
      <div className="cluster">
        <button className="btn btn--ghost" type="button" onClick={() => save()}>Save details</button>
        <button className="btn btn--primary" type="button" onClick={() => save("approved")}>Approve</button>
        <button className="btn btn--ghost" type="button" onClick={() => save("rejected")}>Reject</button>
      </div>
      <div className="field"><label>Payment alert</label><textarea value={alert} onChange={(event) => setAlert(event.target.value)} /></div>
      <button className="btn btn--ghost" type="button" onClick={pay}>Send payment alert to their dashboard</button>
    </div>
  );
}

export function Students() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  function load() {
    getCollection("students").then(setItems).catch((err) => setError(feedbackMessage(err, "Could not load the students. Please try again.")));
  }

  useEffect(() => { load(); }, []);

  async function saveContact(item, phone, country) {
    setError("");
    try {
      await updateStudent(item.id, { phone, country });
      load();
    } catch (err) {
      setError(feedbackMessage(err, "Could not save this student. Please try again."));
    }
  }

  return (
    <>
      <h1>Students</h1>
      <p className="note">Student accounts appear when someone registers. Approve, reject, or send a payment alert only when that person has an application. Course access is managed on the Enrollments page, after they have an account and a group.</p>
      {error ? <p className="form-summary">{error}</p> : null}
      {items.length === 0 ? <div className="panel"><p className="note">No student accounts yet.</p></div> : items.map((item) => (
        <StudentCard key={item.id} item={item} onSave={saveContact} onDone={load} />
      ))}
    </>
  );
}

function StudentCard({ item, onSave, onDone }) {
  const [phone, setPhone] = useState(item.phone || "");
  const [country, setCountry] = useState(item.country || "");
  return (
    <article className="panel" style={{ marginBottom: "0.8rem" }}>
      <h2>{item.name}</h2>
      <p className="note">{item.email}</p>
      <p className="note">Application: {item.application ? item.application.status.replaceAll("_", " ") : "none yet"}</p>
      <div className="field"><label>Phone</label><input value={phone} onChange={(event) => setPhone(event.target.value)} /></div>
      <div className="field"><label>Country</label><input value={country} onChange={(event) => setCountry(event.target.value)} /></div>
      <button className="btn btn--ghost" type="button" onClick={() => onSave(item, phone, country)}>Save student</button>
      {item.application ? <Actions application={item.application} onDone={onDone} /> : null}
    </article>
  );
}
