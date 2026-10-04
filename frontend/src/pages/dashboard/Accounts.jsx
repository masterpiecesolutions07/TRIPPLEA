import { useEffect, useState } from "react";
import { getPeople, setAccountStatus } from "../../api/dashboardApi.js";
import { SaveAlert } from "../../components/SaveAlert.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { feedbackMessage } from "../../utils/feedback.js";

const ROLES = [
  ["", "All roles"],
  ["student", "Students"],
  ["mentor", "Mentors"],
  ["admin", "Admins"]
];

const ACCOUNTS = [
  ["", "All accounts"],
  ["active", "Active"],
  ["paused", "Paused"]
];

const ROLE_LABEL = { student: "Student", mentor: "Mentor", admin: "Admin" };
const APPLICATION = {
  pending: "Application received",
  under_review: "Application under review",
  approved: "Application approved",
  rejected: "Application not accepted",
  waitlisted: "On the waiting list"
};

function shown(value) {
  const text = String(value || "").trim();
  return text || "Not given";
}

export function Accounts() {
  const { user } = useAuth();
  const admin = user?.role === "admin";
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState("");

  function load(next = { q: query, role, status }) {
    getPeople({ q: next.q.trim(), role: next.role, status: next.status })
      .then(setItems)
      .catch((err) => setError(feedbackMessage(err, "Could not load the accounts. Please try again.")));
  }

  useEffect(() => { load({ q: "", role: "", status: "" }); }, []);

  async function change(item, isActive) {
    setError("");
    setSaved("");
    setBusy(item.id);
    try {
      const result = await setAccountStatus(item.id, isActive);
      setSaved(result.message || (isActive ? "Account opened." : "Account paused."));
      load();
    } catch (err) {
      setError(feedbackMessage(err, "Could not update that account. Please try again."));
    } finally {
      setBusy("");
    }
  }

  return (
    <>
      <h1>Accounts</h1>
      <p className="note">{admin
        ? "Search every account. Pausing an account stops sign-in. You can pause students, mentors, and other admins. You cannot pause your own account."
        : "Search every account. You can pause or open student accounts. Mentor and admin accounts stay as they are."}</p>
      <form className="panel people-filters" onSubmit={(event) => { event.preventDefault(); load(); }}>
        <div className="field">
          <label htmlFor="account-search">Search</label>
          <input id="account-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or email" />
        </div>
        <div className="field">
          <label htmlFor="account-role">Role</label>
          <select id="account-role" value={role} onChange={(event) => { setRole(event.target.value); load({ q: query, role: event.target.value, status }); }}>
            {ROLES.map(([value, label]) => <option key={value || "all"} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="account-status">Account</label>
          <select id="account-status" value={status} onChange={(event) => { setStatus(event.target.value); load({ q: query, role, status: event.target.value }); }}>
            {ACCOUNTS.map(([value, label]) => <option key={value || "all"} value={value}>{label}</option>)}
          </select>
        </div>
        <button className="btn btn--primary" type="submit">Search</button>
      </form>
      {error ? <p className="form-summary">{error}</p> : null}
      <SaveAlert message={saved} />
      {items.length === 0 ? <p className="note">No accounts match this search.</p> : (
        <ul className="people-list">
          {items.map((item) => {
            const mine = String(item.id) === String(user?.id || user?._id);
            const canChange = !mine && (admin || item.role === "student");
            return (
              <li key={item.id}>
                <div>
                  <h2>{item.name}</h2>
                  <p>{item.email}</p>
                  <dl className="people-details">
                    <div><dt>Role</dt><dd>{ROLE_LABEL[item.role] || item.role}</dd></div>
                    <div><dt>Phone</dt><dd>{shown(item.phone)}</dd></div>
                    <div><dt>Country</dt><dd>{shown(item.country)}</dd></div>
                    <div><dt>Application</dt><dd>{item.role === "student" ? (APPLICATION[item.applicationStatus] || "No application") : "Not a student"}</dd></div>
                    <div><dt>Account</dt><dd>{item.isActive ? "Active" : "Paused"}</dd></div>
                  </dl>
                </div>
                <div className="people-actions">
                  {canChange ? (
                    <button className="btn btn--primary" type="button" disabled={busy === item.id} onClick={() => change(item, !item.isActive)}>
                      {item.isActive ? "Pause account" : "Open account"}
                    </button>
                  ) : <p className="note">{mine ? "This is your account." : "Only an admin can change this account."}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
