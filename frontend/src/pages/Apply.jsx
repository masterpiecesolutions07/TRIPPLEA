import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance.js";
import { useAuth } from "../context/AuthContext.jsx";
import { feedbackMessage } from "../utils/feedback.js";

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  experience: "",
  mode: "online",
  plan: "",
  heard: "",
  cohortId: "",
  consent: false
};

export function Apply() {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [cohorts, setCohorts] = useState([]);
  const [error, setError] = useState("");
  const [doneEmail, setDoneEmail] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = "Apply · Tripple A"; }, []);

  useEffect(() => {
    api.get("/public/cohorts").then((response) => setCohorts(response.data.items || [])).catch(() => setCohorts([]));
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      fullName: current.fullName || user.name,
      email: current.email || user.email
    }));
  }, [user]);

  function update(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!form.consent) {
      setError("Accept the terms, the privacy notice, and the risk disclaimer.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/public/applications", form);
      setDoneEmail(form.email);
    } catch (err) {
      setError(feedbackMessage(err, "We could not send your application just now. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="crumbs"><Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>Apply</span></p>
          <h1>Apply for the mentorship</h1>
          <p className="lede">Tell Tripple A how you want to study. You do not need an account to send this form, and no payment is taken on this page.</p>
        </div>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: "42rem" }}>
          {doneEmail ? (
            <div className="card form-success" style={{ padding: "1.2rem" }}>
              <h2>Application received</h2>
              <p>Thank you. Plans start from 120 USD, and payment is arranged after approval.</p>
              {user ? (
                <>
                  <p>This application is tied to {doneEmail}. Open your dashboard to see it later.</p>
                  <Link className="btn btn--primary" to="/student">Go to your dashboard</Link>
                </>
              ) : (
                <>
                  <p>Create an account with <strong>{doneEmail}</strong> so you can follow this application and open your dashboard later.</p>
                  <div className="cluster">
                    <Link className="btn btn--primary" to="/register">Create an account</Link>
                    <Link className="btn btn--ghost" to="/login">Log in</Link>
                  </div>
                </>
              )}
            </div>
          ) : (
            <form className="card form" style={{ padding: "1.2rem" }} onSubmit={submit}>
              <p className="note">An account is optional. Create one with the same email afterwards if you want updates on this application and access to your dashboard.</p>
              {error ? <p className="form-summary" role="alert">{error}</p> : null}
              <div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" autoComplete="name" required value={form.fullName} onChange={update} /></div>
              <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update} /></div>
              <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" autoComplete="tel" required value={form.phone} onChange={update} /></div>
              <div className="field"><label htmlFor="country">Country</label><input id="country" name="country" autoComplete="country-name" required value={form.country} onChange={update} /></div>
              <div className="field"><label htmlFor="city">City</label><input id="city" name="city" autoComplete="address-level2" value={form.city} onChange={update} /></div>
              <div className="field">
                <label htmlFor="experience">Trading experience</label>
                <select id="experience" name="experience" required value={form.experience} onChange={update}>
                  <option value="">Choose a level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="cohortId">Cohort</label>
                <select id="cohortId" name="cohortId" value={form.cohortId} onChange={update}>
                  <option value="">{cohorts.length ? "Choose an open cohort" : "No cohort is open yet. Your details will be kept for the next intake."}</option>
                  {cohorts.map((item) => (
                    <option key={item._id} value={item._id}>{item.name} · {item.mode} · from {item.priceFrom} USD</option>
                  ))}
                </select>
              </div>
              <fieldset className="field">
                <legend>Preferred attendance</legend>
                <div className="choice-row">
                  <label className="choice"><input type="radio" name="mode" value="online" checked={form.mode === "online"} onChange={update} /> <strong>Online</strong><span className="note">Zoom and Google Meet</span></label>
                  <label className="choice"><input type="radio" name="mode" value="physical" checked={form.mode === "physical"} onChange={update} /> <strong>Physical</strong><span className="note">With the cohort</span></label>
                </div>
              </fieldset>
              <div className="field">
                <label htmlFor="plan">Price plan</label>
                <select id="plan" name="plan" required value={form.plan} onChange={update}>
                  <option value="">Choose a plan</option>
                  <option value="starter">Starter — from 120 USD</option>
                  <option value="premium">Premium — quoted above 120 USD</option>
                  <option value="custom">Request a custom price</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="heard">How did you hear about Tripple A?</label>
                <select id="heard" name="heard" required value={form.heard} onChange={update}>
                  <option value="">Choose one</option>
                  {["TikTok", "Instagram", "YouTube", "Facebook", "WhatsApp", "A friend", "Other"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div className="disclaimer"><strong>Risk disclaimer.</strong> Forex and CFD trading carries a high risk of loss. This mentorship is education. It is not financial advice and it does not promise profit.</div>
              <label className="check"><input type="checkbox" name="consent" checked={form.consent} onChange={update} /> <span>I accept the <Link to="/terms">terms</Link>, the <Link to="/privacy">privacy notice</Link>, and the risk disclaimer.</span></label>
              <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Sending…" : "Submit application"}</button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
