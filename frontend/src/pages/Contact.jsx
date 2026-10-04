import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance.js";
import { Icon } from "../components/Icon.jsx";
import { feedbackMessage } from "../utils/feedback.js";

const EMPTY = { name: "", email: "", phone: "", subject: "", message: "" };

export function Contact() {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  useEffect(() => { document.title = "Contact · Tripple A"; }, []);

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSent("");
    try {
      await api.post("/messages", form);
      setSent(form.name);
      setForm(EMPTY);
    } catch (err) {
      setError(feedbackMessage(err, "We could not send your message just now. Please try again."));
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="crumbs"><Link to="/">Home</Link> <span aria-hidden="true">/</span> <span>Contact</span></p>
          <p className="eyebrow">Contact</p>
          <h1>Talk to Tripple A</h1>
          <p className="lede">Write to Abdullahi Abukar Ahmed, or reach him on TikTok as @tripple.a75. Online classes use Zoom and Google Meet. In-person details go to enrolled students.</p>
        </div>
      </section>
      <section className="section" id="direct">
        <div className="container contact-grid">
          <div className="stack">
            <article className="card" style={{ padding: "1.2rem" }}>
              <h2>Direct</h2>
              <ul className="contact-list" style={{ marginTop: "0.8rem" }}>
                <li><Icon name="i-tiktok" /><div><strong>TikTok</strong><p><a href="https://www.tiktok.com/@tripple.a75" target="_blank" rel="noopener noreferrer">@tripple.a75</a></p></div></li>
                <li><Icon name="i-mail" /><div><strong>Message</strong><p>Use the form on this page. Include a phone number if you want a call back.</p></div></li>
                <li><Icon name="i-pin" /><div><strong>Sessions</strong><p>Online on Zoom and Google Meet.</p><p className="note">In person with the January 2027 cohort. The venue is sent after you register.</p></div></li>
                <li><Icon name="i-clock" /><div><strong>Hours</strong><p>Monday to Friday, 09:00–17:00 EAT</p><p className="note">Saturday by appointment. Sunday closed.</p></div></li>
              </ul>
            </article>
            <article className="card" id="socials" style={{ padding: "1.2rem" }}>
              <h2>Socials</h2>
              <p className="note" style={{ marginTop: "0.8rem" }}>TikTok is live at @tripple.a75. Discord is the student community once you are enrolled. Other channels stay on this page until a link is confirmed.</p>
            </article>
          </div>
          <div className="card" style={{ padding: "1.2rem" }}>
            <h2>Send a message</h2>
            {sent ? <div className="form-success"><h3>Message received</h3><p>Thank you, {sent}. Tripple A can also be reached on TikTok @tripple.a75.</p></div> : (
              <form className="form" onSubmit={submit} style={{ marginTop: "1rem" }}>
                {error ? <p className="form-summary" role="alert">{error}</p> : null}
                <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" autoComplete="name" required value={form.name} onChange={update} /></div>
                <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update} /></div>
                <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" autoComplete="tel" required value={form.phone} onChange={update} /></div>
                <div className="field">
                  <label htmlFor="subject">Subject</label>
                  <select id="subject" name="subject" required value={form.subject} onChange={update}>
                    <option value="">Choose a subject</option>
                    {["General", "Mentorship", "Custom pricing", "Partnership", "Other"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div className="field"><label htmlFor="message">Message</label><textarea id="message" name="message" required value={form.message} onChange={update} /></div>
                <button className="btn btn--primary" type="submit">Send message</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
