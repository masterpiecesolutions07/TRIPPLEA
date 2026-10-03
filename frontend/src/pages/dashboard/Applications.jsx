import { useEffect, useState } from "react";
import { getCollection, setApplicationStatus } from "../../api/dashboardApi.js";

const STATUSES = ["pending", "under_review", "approved", "rejected", "waitlisted"];

export function Applications() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  function load(next = status) {
    const query = next ? `applications?status=${next}` : "applications";
    getCollection(query).then(setItems).catch((err) => setError(err.response?.data?.message || "Could not load applications."));
  }

  useEffect(() => { load(""); }, []);

  async function change(id, next) {
    await setApplicationStatus(id, next);
    load();
  }

  return (
    <>
      <h1>Applications</h1>
      <div className="filters" role="group" aria-label="Filter by status">
        <button type="button" aria-pressed={status === ""} onClick={() => { setStatus(""); load(""); }}>All</button>
        {STATUSES.map((item) => (
          <button key={item} type="button" aria-pressed={status === item} onClick={() => { setStatus(item); load(item); }}>{item}</button>
        ))}
      </div>
      {error ? <p className="form-summary">{error}</p> : null}
      {items.length === 0 ? <p className="note">No applications yet.</p> : (
        <div className="table-wrap panel">
          <table className="dash-table">
            <thead><tr><th>Name</th><th>Email</th><th>Plan</th><th>Mode</th><th>Status</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.fullName}</td>
                  <td>{item.email}</td>
                  <td>{item.plan}</td>
                  <td>{item.mode}</td>
                  <td>
                    <select value={item.status} aria-label={`Status for ${item.fullName}`} onChange={(event) => change(item._id, event.target.value)}>
                      {STATUSES.map((option) => <option key={option}>{option}</option>)}
                    </select>
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
