import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { extendCohortAccess, getCollection, getEnrollments, openEnrollment, updateEnrollments } from "../../api/dashboardApi.js";
import { SaveAlert } from "../../components/SaveAlert.jsx";
import { feedbackMessage } from "../../utils/feedback.js";

const ACCESS = { open: "Open", paused: "Paused", ended: "Ended" };

function showDate(value) {
  if (!value) return "No end date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No end date";
  return date.toLocaleDateString("en-GB");
}

function blockedCopy(application) {
  if (application?.status === "rejected") return "The application was not accepted, so the course stays closed.";
  if (application?.status === "waitlisted") return "They are on the waiting list, so the course stays closed.";
  return "";
}

export function Enrollments() {
  const [data, setData] = useState(null);
  const [cohorts, setCohorts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [picked, setPicked] = useState([]);
  const [endDate, setEndDate] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groupDate, setGroupDate] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    return Promise.all([getEnrollments(), getCollection("cohorts")])
      .then(([next, groups]) => {
        setData(next);
        setCohorts(groups);
        setGroupId((current) => current || groups[0]?._id || "");
      })
      .catch((err) => setError(feedbackMessage(err, "Could not load course access. Please try again.")));
  }

  useEffect(() => { load(); }, []);

  const items = (data?.items || []).filter((item) => filter === "all" || item.access === filter);
  const waiting = filter === "all" || filter === "waiting" ? (data?.waiting || []) : [];

  function toggle(id) {
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function run(work) {
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const result = await work();
      setSaved(result?.message || "Saved.");
      setPicked([]);
      await load();
    } catch (err) {
      setError(feedbackMessage(err, "Could not save that change. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  async function changeSelected(status) {
    if (!picked.length) return;
    if (status === "removed" && !window.confirm("End course access for the selected students? You can open it again later.")) return;
    await run(() => updateEnrollments({ ids: picked, status }));
  }

  async function dateSelected(event) {
    event.preventDefault();
    if (!picked.length) return;
    await run(() => updateEnrollments({ ids: picked, accessUntil: endDate }));
  }

  async function dateForGroup(event) {
    event.preventDefault();
    if (!groupId || !groupDate) return;
    const group = cohorts.find((item) => item._id === groupId);
    if (!window.confirm(`Set this end date for everyone in ${group?.name || "this group"}?`)) return;
    await run(() => extendCohortAccess({ cohortId: groupId, accessUntil: groupDate }));
  }

  if (!data) return <p>{error || "Loading course access…"}</p>;

  return (
    <>
      <h1>Enrollments</h1>
      <p className="note">Approving an application opens the course once that person has a student account. Access stays open with no end date unless you set one. Pausing keeps their progress. Nothing is sent by email.</p>
      {error ? <p className="form-summary">{error}</p> : null}
      <SaveAlert message={saved} />
      <div className="filters" role="group" aria-label="Filter course access">
        {[
          ["all", "All"],
          ["open", "Open"],
          ["paused", "Paused"],
          ["ended", "Ended"],
          ["waiting", "Waiting for a group"]
        ].map(([value, label]) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>
        ))}
      </div>

      {filter !== "waiting" ? (
        <section className="panel course-block">
          <h2>Selected students</h2>
          <div className="cluster">
            <button className="btn btn--primary btn--small" type="button" disabled={busy || !picked.length} onClick={() => changeSelected("active")}>Open selected</button>
            <button className="btn btn--ghost btn--small" type="button" disabled={busy || !picked.length} onClick={() => changeSelected("inactive")}>Pause selected</button>
            <button className="btn btn--ghost btn--small" type="button" disabled={busy || !picked.length} onClick={() => changeSelected("removed")}>End access</button>
          </div>
          <form className="cluster" onSubmit={dateSelected}>
            <div className="field">
              <label htmlFor="selected-until">End date for the selected students</label>
              <input id="selected-until" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              <p className="note">Leave this blank and they keep open access.</p>
            </div>
            <button className="btn btn--ghost" type="submit" disabled={busy || !picked.length}>Save end date</button>
          </form>
        </section>
      ) : null}

      {items.length === 0 && filter !== "waiting" ? <div className="panel course-block"><p className="note">No students with course access in this list.</p></div> : null}
      {items.map((item) => (
        <article className="panel course-block" key={item._id}>
          <label className="check">
            <input type="checkbox" checked={picked.includes(item._id)} onChange={() => toggle(item._id)} />
            <span>Select</span>
          </label>
          <h2><Link to={`/mentor/enrollments/${item._id}`}>{item.student?.name || "Account removed"}</Link></h2>
          <p className="note">{item.student?.email || "No email on this record."}</p>
          <p className="note">{ACCESS[item.access] || "Ended"} · {item.cohort?.name || "No group"} · {item.accessUntil ? `until ${showDate(item.accessUntil)}` : "no end date"}</p>
          {blockedCopy(item.application) ? <p className="form-summary">{blockedCopy(item.application)}</p> : null}
          <Link className="btn btn--ghost btn--small" to={`/mentor/enrollments/${item._id}`}>Manage access</Link>
        </article>
      ))}

      {waiting.length ? (
        <section className="course-block">
          <h2>Waiting for a group</h2>
          <p className="note">These applications are approved, and the course is not open yet. They need a student account with the same email. A group is optional.</p>
          {waiting.map((item) => (
            <WaitingCard key={item.applicationId} item={item} cohorts={cohorts} busy={busy} onOpen={(payload) => run(() => openEnrollment(payload))} />
          ))}
        </section>
      ) : null}

      <form className="panel dash-form course-block" onSubmit={dateForGroup}>
        <h2>End date for a whole group</h2>
        <p className="note">Use this only when a group should stop on a chosen day. Otherwise leave access open with no end date.</p>
        {cohorts.length === 0 ? <p className="note">No groups yet. Create one under Cohorts.</p> : (
          <>
            <div className="field">
              <label htmlFor="group-id">Group</label>
              <select id="group-id" value={groupId} onChange={(event) => setGroupId(event.target.value)}>
                {cohorts.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="group-until">End date</label>
              <input id="group-until" type="date" value={groupDate} onChange={(event) => setGroupDate(event.target.value)} required />
            </div>
            <button className="btn btn--primary" type="submit" disabled={busy}>Save for this group</button>
          </>
        )}
      </form>
    </>
  );
}

function WaitingCard({ item, cohorts, busy, onOpen }) {
  const [cohortId, setCohortId] = useState(item.cohortId || "");
  return (
    <article className="panel course-block">
      <h2>{item.name}</h2>
      <p className="note">{item.email}</p>
      {item.hasAccount ? (
        <form className="cluster" onSubmit={(event) => { event.preventDefault(); onOpen({ applicationId: item.applicationId, cohortId }); }}>
          {cohorts.length ? (
            <div className="field">
              <label htmlFor={`group-${item.applicationId}`}>Group</label>
              <select id={`group-${item.applicationId}`} value={cohortId} onChange={(event) => setCohortId(event.target.value)}>
                <option value="">No group</option>
                {cohorts.map((group) => <option key={group._id} value={group._id}>{group.name}</option>)}
              </select>
            </div>
          ) : null}
          <button className="btn btn--primary" type="submit" disabled={busy}>Open the course</button>
        </form>
      ) : <p className="note">Ask them to create an account with this email first.</p>}
    </article>
  );
}
