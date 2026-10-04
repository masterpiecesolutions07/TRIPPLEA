import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getEnrollment, removeEnrollment, updateEnrollmentAccess, updateEnrollmentStatus } from "../../api/dashboardApi.js";
import { SaveAlert } from "../../components/SaveAlert.jsx";
import { feedbackMessage } from "../../utils/feedback.js";

const ACCESS = { open: "Open", paused: "Paused", ended: "Ended" };

function showDate(value) {
  if (!value) return "No end date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No end date";
  return date.toLocaleDateString("en-GB");
}

function dateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function toggleId(list, id) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function EnrollmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("active");
  const [reason, setReason] = useState("");
  const [until, setUntil] = useState("");
  const [phasesOn, setPhasesOn] = useState([]);
  const [modulesOn, setModulesOn] = useState([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);

  function apply(next) {
    setData(next);
    setStatus(next.item.status);
    setReason(next.item.reason || "");
    setUntil(dateInput(next.item.accessUntil));
    setPhasesOn(next.item.unlockedPhases || []);
    setModulesOn(next.item.unlockedModules || []);
  }

  useEffect(() => {
    getEnrollment(id).then(apply).catch((err) => setError(feedbackMessage(err, "Could not load this student. Please try again.")));
  }, [id]);

  async function run(work) {
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const result = await work();
      if (result?.item) apply({ ...data, item: result.item });
      setSaved(result?.message || "Saved.");
    } catch (err) {
      setError(feedbackMessage(err, "Could not save that change. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  async function saveStatus(event) {
    event.preventDefault();
    await run(() => updateEnrollmentStatus(id, { status, reason }));
  }

  async function saveDate(event) {
    event.preventDefault();
    await run(() => updateEnrollmentAccess(id, { accessUntil: until }));
  }

  async function saveUnlocks(event) {
    event.preventDefault();
    await run(() => updateEnrollmentAccess(id, { unlockedPhases: phasesOn, unlockedModules: modulesOn }));
  }

  async function remove() {
    if (!window.confirm("Remove this course record for good? The application stays approved, and you can open the course again later.")) return;
    setBusy(true);
    setError("");
    try {
      await removeEnrollment(id);
      navigate("/mentor/enrollments");
    } catch (err) {
      setError(feedbackMessage(err, "Could not remove this record. Please try again."));
      setBusy(false);
    }
  }

  if (!data) return <p>{error || "Loading this student…"}</p>;
  const { item, phases, progress, unlockMode } = data;
  const blocked = item.application?.status === "rejected"
    ? "The application was not accepted, so the course stays closed."
    : item.application?.status === "waitlisted"
      ? "They are on the waiting list, so the course stays closed."
      : "";

  return (
    <>
      <p><Link to="/mentor/enrollments">Back to enrollments</Link></p>
      <h1>{item.student?.name || "Account removed"}</h1>
      <p className="note">{item.student?.email || "No email on this record."}</p>
      <p className="note">{ACCESS[item.access]} · {item.cohort?.name || "No group"} · {item.accessUntil ? `course access until ${showDate(item.accessUntil)}` : "no end date, access stays open"}</p>
      <p className="note">Lessons finished: {progress.completed} of {progress.total}.</p>
      {blocked ? <p className="form-summary">{blocked}</p> : null}
      {error ? <p className="form-summary">{error}</p> : null}
      <SaveAlert message={saved} />

      <form className="panel dash-form course-block" onSubmit={saveStatus}>
        <h2>Access</h2>
        <div className="field">
          <label htmlFor="enroll-status">Status</label>
          <select id="enroll-status" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="active">Open</option>
            <option value="inactive">Paused</option>
            <option value="removed">Ended</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="enroll-reason">Note for mentors</label>
          <textarea id="enroll-reason" rows={3} value={reason} onChange={(event) => setReason(event.target.value)} />
        </div>
        <p className="note">Pausing keeps their progress. This note stays on this page. The student sees a short update on their dashboard, not this note.</p>
        <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save access"}</button>
      </form>

      <form className="panel dash-form course-block" onSubmit={saveDate}>
        <h2>End date</h2>
        <p className="note">Leave the date empty and access stays open. A date closes the course at the end of that day.</p>
        <div className="field">
          <label htmlFor="enroll-until">Course access until</label>
          <input id="enroll-until" type="date" value={until} onChange={(event) => setUntil(event.target.value)} />
        </div>
        <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save end date"}</button>
      </form>

      <form className="panel dash-form course-block" onSubmit={saveUnlocks}>
        <h2>Open a part early</h2>
        <p className="note">{unlockMode === "open"
          ? "All published phases can open together. A tick still marks a part this student may open early."
          : "Phases open one at a time. Tick a phase to open that whole phase early, or tick a module on its own."}</p>
        {phases.map((phase) => (
          <fieldset key={phase._id} className="course-block">
            <label className="check">
              <input type="checkbox" checked={phasesOn.includes(String(phase._id))} onChange={() => setPhasesOn((current) => toggleId(current, String(phase._id)))} />
              <span>Open {phase.title} early</span>
            </label>
            <div className="enroll-modules">
              {phase.modules.map((item) => (
                <label className="check" key={item._id}>
                  <input type="checkbox" checked={modulesOn.includes(String(item._id))} onChange={() => setModulesOn((current) => toggleId(current, String(item._id)))} />
                  <span>{item.title}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save early access"}</button>
      </form>

      {user?.role === "admin" ? (
        <div className="panel course-block">
          <h2>Remove the record</h2>
          <p className="note">This deletes the course place. The application stays approved. Lesson progress stays stored.</p>
          <button className="btn btn--ghost" type="button" disabled={busy} onClick={remove}>Remove record</button>
        </div>
      ) : null}
    </>
  );
}
