import { useEffect, useState } from "react";
import { createCohort, getCollection } from "../../api/dashboardApi.js";

const EMPTY = { name: "", startDate: "", mode: "both", seatLimit: 20, priceFrom: 120, venue: "", publishAlert: true };

export function Cohorts() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  function load() {
    getCollection("cohorts").then(setItems).catch((err) => setError(err.response?.data?.message || "Could not load cohorts."));
  }

  useEffect(() => { load(); }, []);

  function update(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await createCohort({
        ...form,
        seatLimit: Number(form.seatLimit),
        priceFrom: Number(form.priceFrom)
      });
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the cohort.");
    }
  }

  return (
    <>
      <h1>Cohorts</h1>
      <form className="panel dash-form" onSubmit={submit}>
        <h2>New cohort</h2>
        <p className="note">The end date is three months after the start date.</p>
        {error ? <p className="form-summary">{error}</p> : null}
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
      <div className="table-wrap panel" style={{ marginTop: "1rem" }}>
        {items.length === 0 ? <p className="note">No cohorts yet.</p> : (
          <table className="dash-table">
            <thead><tr><th>Name</th><th>Start</th><th>End</th><th>Mode</th><th>Status</th><th>Seats</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{new Date(item.startDate).toLocaleDateString("en-GB")}</td>
                  <td>{new Date(item.endDate).toLocaleDateString("en-GB")}</td>
                  <td>{item.mode}</td>
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
