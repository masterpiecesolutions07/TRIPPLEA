import { useEffect, useState } from "react";
import { getApplications, removeApplication, setApplicationStatus } from "../../api/dashboardApi.js";
import { SaveAlert } from "../../components/SaveAlert.jsx";
import { feedbackMessage } from "../../utils/feedback.js";

const STATUSES = [
  ["", "All"],
  ["pending", "Received"],
  ["under_review", "Under review"],
  ["approved", "Approved"],
  ["rejected", "Not accepted"],
  ["waitlisted", "Waiting list"]
];

const LABEL = Object.fromEntries(STATUSES);
const PLAN = { starter: "Starter", premium: "Premium", custom: "Custom price" };
const MODE = { online: "Online", physical: "In person" };
const LEVEL = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };

function shown(value) {
  const text = String(value || "").trim();
  return text || "Not given";
}

function appliedOn(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not given";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function Applications() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState("");

  function load(nextStatus = status, nextQuery = query) {
    getApplications({ status: nextStatus, q: nextQuery.trim() })
      .then(setItems)
      .catch((err) => setError(feedbackMessage(err, "Could not load the applications. Please try again.")));
  }

  useEffect(() => { load("", ""); }, []);

  async function change(id, next) {
    setError("");
    setSaved("");
    setBusy(id);
    try {
      await setApplicationStatus(id, next);
      setSaved(next === "approved" ? "Application approved." : "Application marked as not accepted.");
      load();
    } catch (err) {
      setError(feedbackMessage(err, "Could not save that change. Please try again."));
    } finally {
      setBusy("");
    }
  }

  async function remove(item) {
    if (!window.confirm(`Remove the application from ${item.fullName}? Their account stays. If the course was open, it will pause.`)) return;
    setError("");
    setSaved("");
    setBusy(item._id);
    try {
      setSaved(await removeApplication(item._id));
      load();
    } catch (err) {
      setError(feedbackMessage(err, "Could not remove that application. Please try again."));
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <h1>Applications</h1>
      <p className="note">Each row is one applicant. Approve opens the course once they have a student account. Reject closes it. Delete removes the application only.</p>
      <form className="panel people-filters" onSubmit={(event) => { event.preventDefault(); load(); }}>
        <div className="field">
          <label htmlFor="application-search">Search</label>
          <input id="application-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email, phone, or country" />
        </div>
        <button className="btn btn--primary" type="submit">Search</button>
      </form>
      <div className="filters" role="group" aria-label="Filter by status">
        {STATUSES.map(([value, label]) => (
          <button key={value || "all"} type="button" aria-pressed={status === value} onClick={() => { setStatus(value); load(value); }}>{label}</button>
        ))}
      </div>
      {error ? <p className="form-summary">{error}</p> : null}
      <SaveAlert message={saved} />
      {items.length === 0 ? <p className="note">No applications match this search.</p> : (
        <div className="table-wrap panel">
          <table className="dash-table applicant-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Country</th>
                <th>City</th>
                <th>Experience</th>
                <th>Plan</th>
                <th>Attendance</th>
                <th>Group</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.fullName}</td>
                  <td>{item.email}</td>
                  <td>{shown(item.phone)}</td>
                  <td>{shown(item.country)}</td>
                  <td>{shown(item.city)}</td>
                  <td>{LEVEL[item.experience] || shown(item.experience)}</td>
                  <td>{PLAN[item.plan] || shown(item.plan)}</td>
                  <td>{MODE[item.mode] || shown(item.mode)}</td>
                  <td>{item.cohort?.name || "No group"}</td>
                  <td>{appliedOn(item.createdAt)}</td>
                  <td>{LABEL[item.status] || "Received"}</td>
                  <td>
                    <div className="people-actions">
                      <button className="btn btn--primary btn--small" type="button" disabled={busy === item._id || item.status === "approved"} onClick={() => change(item._id, "approved")}>Approve</button>
                      <button className="btn btn--ghost btn--small" type="button" disabled={busy === item._id || item.status === "rejected"} onClick={() => change(item._id, "rejected")}>Reject</button>
                      <button className="btn btn--ghost btn--small" type="button" disabled={busy === item._id} onClick={() => remove(item)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
