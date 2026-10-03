import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const EMPTY = { name: "", email: "", password: "", confirm: "", terms: false };

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = "Create an account · Tripple A"; }, []);

  function update(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!form.terms) {
      setError("Accept the terms and the privacy notice.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate("/apply", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the account. Check that the API and MongoDB are running.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Create an account</h1>
          <p className="lede">This only creates your Tripple A account. You can apply for the mentorship after you sign in.</p>
        </div>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: "36rem" }}>
          <div className="auth-card card">
            <form className="form" onSubmit={submit}>
              {error ? <p className="form-summary" role="alert">{error}</p> : null}
              <div className="field"><label htmlFor="name">Full name</label><input id="name" name="name" autoComplete="name" required maxLength={80} value={form.name} onChange={update} /></div>
              <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update} /></div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" autoComplete="new-password" required value={form.password} onChange={update} />
                <p className="note">At least 8 characters, with upper case, lower case, and a number.</p>
              </div>
              <div className="field"><label htmlFor="confirm">Confirm password</label><input id="confirm" name="confirm" type="password" autoComplete="new-password" required value={form.confirm} onChange={update} /></div>
              <label className="check"><input type="checkbox" name="terms" checked={form.terms} onChange={update} /> <span>I accept the <Link to="/terms">terms</Link> and the <Link to="/privacy">privacy notice</Link>.</span></label>
              <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
              <p className="note">Already have an account? <Link to="/login">Log in</Link>. Ready to join a cohort? <Link to="/apply">Apply for the mentorship</Link>.</p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
