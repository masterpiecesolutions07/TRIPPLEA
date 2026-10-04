import { useEffect, useState } from "react";
import { getAudit, getAnalytics, getSettings, saveSettings } from "../../api/dashboardApi.js";
import { SaveAlert } from "../../components/SaveAlert.jsx";
import { feedbackMessage } from "../../utils/feedback.js";

export function AuditLog() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    getAudit().then(setItems).catch((err) => setError(feedbackMessage(err, "Could not load the activity record. Please try again.")));
  }, []);
  return (
    <>
      <h1>Audit log</h1>
      {error ? <p className="form-summary">{error}</p> : null}
      {items.length === 0 ? <p className="note">No recorded actions yet.</p> : (
        <div className="table-wrap panel">
          <table className="dash-table">
            <thead><tr><th>When</th><th>Action</th><th>Entity</th><th>Actor</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{new Date(item.createdAt).toLocaleString("en-GB")}</td>
                  <td>{item.action}</td>
                  <td>{item.entity}</td>
                  <td>{item.actor?.email || "system"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    getAnalytics().then(setData).catch((err) => setError(feedbackMessage(err, "Could not load the summary. Please try again.")));
  }, []);
  const tiles = data ? [
    ["Users", data.users],
    ["Students", data.students],
    ["Mentors", data.mentors],
    ["Applications", data.applications],
    ["Cohorts", data.cohorts],
    ["Published trades", data.publishedTrades]
  ] : [];
  return (
    <>
      <h1>Analytics</h1>
      {error ? <p className="form-summary">{error}</p> : null}
      <div className="stat-row">
        {tiles.map(([label, value]) => (
          <article className="stat-tile" key={label}><b>{value}</b><span>{label}</span></article>
        ))}
      </div>
      {data ? <p className="note" style={{ marginTop: "1rem" }}>{data.note}</p> : null}
    </>
  );
}

export function SettingsPage() {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    getSettings().then((item) => {
      setForm({
        email: item?.email || "",
        phoneDisplay: item?.phoneDisplay || "",
        whatsappNumber: item?.whatsappNumber || "",
        location: item?.location || "",
        tiktok: item?.socials?.tiktok || "",
        facebook: item?.socials?.facebook || "",
        youtube: item?.socials?.youtube || "",
        discord: item?.socials?.discord || "",
        instagram: item?.socials?.instagram || "",
        strategyCredit: item?.strategyCredit || "Strategy compiled by Grand Mentor Abdiwali Moalimuu."
      });
    }).catch((err) => setError(feedbackMessage(err, "Could not load the settings. Please try again.")));
  }, []);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaved("");
    try {
      await saveSettings(form);
      setSaved("Settings saved.");
    } catch (err) {
      setError(feedbackMessage(err, "Could not save the settings. Please try again."));
    }
  }

  if (!form) return <p>{error || "Loading settings…"}</p>;
  return (
    <>
      <h1>Site settings</h1>
      <form className="panel dash-form" onSubmit={submit}>
        {error ? <p className="form-summary">{error}</p> : null}
        <SaveAlert message={saved} />
        {["email", "phoneDisplay", "whatsappNumber", "location", "tiktok", "facebook", "youtube", "discord", "instagram", "strategyCredit"].map((name) => (
          <div className="field" key={name}>
            <label htmlFor={name}>{name}</label>
            <input id={name} name={name} value={form[name]} onChange={update} />
          </div>
        ))}
        <button className="btn btn--primary" type="submit">Save settings</button>
      </form>
    </>
  );
}
