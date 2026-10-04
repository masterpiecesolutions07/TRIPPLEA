import { useEffect, useState } from "react";
import { addCohortStudents, createCohort, getApplications, getCollection } from "../../api/dashboardApi.js";
import { SaveAlert } from "../../components/SaveAlert.jsx";
import { feedbackMessage } from "../../utils/feedback.js";

const EMPTY = { name: "", startDate: "", mode: "both", seatLimit: 20, priceFrom: 120, venue: "", publishAlert: true };
const MODE = { both: "Online and in person", online: "Online", physical: "In person" };

function groupId(application) {
  if (!application?.cohort) return "";
  return String(application.cohort._id || application.cohort);
}

export function Cohorts() {
  const [items, setItems] = useState([]);
  const [approved, setApproved] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [group, setGroup] = useState("");
  const [picked, setPicked] = useState([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  function load() {
    getCollection("cohorts").then((rows) => {
      setItems(rows);
      setGroup((current) => current || rows[0]?._id || "");
    }).catch((err) => setError(feedbackMessage(err, "Could not load the groups. Please try again.")));
    getApplications({ status: "approved" }).then(setApproved).catch(() => setApproved([]));
  }

  useEffect(() => { load(); }, []);

  function update(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function toggleStudent(id) {
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaved("");
    try {
      await createCohort({
        ...form,
        seatLimit: Number(form.seatLimit),
        priceFrom: Number(form.priceFrom)
      });
      setForm(EMPTY);
      setSaved("Group saved.");
      load();
    } catch (err) {
      setError(feedbackMessage(err, "Could not create the group. Please try again."));
    }
  }

  async function addStudents(event) {
    event.preventDefault();
    setError("");
    setSaved("");
    if (!group) {
      setError("Create a group first.");
      return;
    }
    if (!picked.length) {
      setError("Choose at least one approved student.");
      return;
    }
    try {
      const message = await addCohortStudents(group, picked);
      setPicked([]);
      setSaved(message || "Students added to the group.");
      load();
    } catch (err) {
      setError(feedbackMessage(err, "Could not add those students. Please try again."));
    }
  }

  const inGroup = approved.filter((item) => groupId(item) === group);
  const available = approved.filter((item) => groupId(item) !== group);

  return (
    <>
      <h1>Cohorts</h1>
      {error ? <p className="form-summary">{error}</p> : null}
      <SaveAlert message={saved} />
      <form className="panel dash-form" onSubmit={submit}>
        <h2>New cohort</h2>
        <p className="note">The end date is three months after the start date. After the group exists, add approved applicants below.</p>
        <div className="field"><label htmlFor="cohort-name">Name</label><input id="cohort-name" name="name" required value={form.name} onChange={update} /></div>
        <div className="field"><label htmlFor="startDate">Start date</label><input id="startDate" name="startDate" type="date" required value={form.startDate} onChange={update} /></div>
        <div className="field">
          <label htmlFor="mode">Mode</label>
          <select id="mode" name="mode" value={form.mode} onChange={update}>
            <option value="both">Online and in person</option>
            <option value="online">Online</option>
            <option value="physical">In person</option>
          </select>
        </div>
        <div className="field"><label htmlFor="seatLimit">Seat limit</label><input id="seatLimit" name="seatLimit" type="number" min="1" value={form.seatLimit} onChange={update} /></div>
        <div className="field"><label htmlFor="priceFrom">Price from (USD)</label><input id="priceFrom" name="priceFrom" type="number" min="0" value={form.priceFrom} onChange={update} /></div>
        <div className="field"><label htmlFor="venue">Venue note</label><input id="venue" name="venue" value={form.venue} onChange={update} placeholder="Sent to enrolled students" /></div>
        <label className="check"><input type="checkbox" name="publishAlert" checked={form.publishAlert} onChange={update} /> Publish a public notification</label>
        <button className="btn btn--primary" type="submit">Create cohort</button>
      </form>

      <form className="panel dash-form" onSubmit={addStudents}>
        <h2>Add approved students</h2>
        <p className="note">Only applicants who have been approved can be added. Their course stays open, and this group is where their sessions appear.</p>
        {items.length === 0 ? <p className="note">Create a cohort first.</p> : (
          <>
            <div className="field">
              <label htmlFor="cohort-pick">Group</label>
              <select id="cohort-pick" value={group} onChange={(event) => { setGroup(event.target.value); setPicked([]); }}>
                {items.map((item) => (
                  <option key={item._id} value={item._id}>{item.name} · {item.seatsTaken}/{item.seatLimit} seats</option>
                ))}
              </select>
            </div>
            {inGroup.length > 0 ? (
              <p className="note">Already in this group: {inGroup.map((item) => item.fullName).join(", ")}.</p>
            ) : null}
            {available.length === 0 ? <p className="note">No other approved applicants are waiting.</p> : (
              <ul className="pick-list">
                {available.map((item) => (
                  <li key={item._id}>
                    <label>
                      <input type="checkbox" checked={picked.includes(item._id)} onChange={() => toggleStudent(item._id)} />
                      <span>
                        <strong>{item.fullName}</strong>
                        <span className="note">{item.email}{item.cohort?.name ? ` · currently in ${item.cohort.name}` : " · no group yet"}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <button className="btn btn--primary" type="submit" disabled={!available.length}>Add to this group</button>
          </>
        )}
      </form>

      <div className="table-wrap panel">
        {items.length === 0 ? <p className="note">No cohorts yet.</p> : (
          <table className="dash-table">
            <thead><tr><th>Name</th><th>Start</th><th>End</th><th>Mode</th><th>Status</th><th>Seats</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{new Date(item.startDate).toLocaleDateString("en-GB")}</td>
                  <td>{new Date(item.endDate).toLocaleDateString("en-GB")}</td>
                  <td>{MODE[item.mode] || item.mode}</td>
                  <td>{item.status}</td>
                  <td>{item.seatsTaken}/{item.seatLimit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
