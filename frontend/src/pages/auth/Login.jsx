import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { PasswordField } from "../../components/PasswordField.jsx";
import { feedbackMessage } from "../../utils/feedback.js";
import { homePath } from "../../utils/homePath.js";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = "Log in · Tripple A"; }, []);

  function update(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const next = await login(form);
      navigate(homePath(next), { replace: true });
    } catch (err) {
      setError(feedbackMessage(err, "We could not sign you in just now. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Log in</h1>
          <p className="lede">Use the email and password from the student account you created. A new visitor needs an account before this page will accept them.</p>
        </div>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: "36rem" }}>
          <div className="auth-card card">
            <form className="form" onSubmit={submit}>
              {error ? (
                <p className="form-summary" role="alert">
                  {error}{" "}
                  <Link to="/register">Create a student account</Link> if you have not signed up yet.
                </p>
              ) : null}
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" autoComplete="username" required value={form.email} onChange={update} />
              </div>
              <PasswordField id="password" label="Password" name="password" autoComplete="current-password" value={form.password} onChange={update} />
              <label className="check"><input type="checkbox" name="remember" checked={form.remember} onChange={update} /> <span>Remember me on this device</span></label>
              <button className="btn btn--primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Log in"}</button>
              <p className="note">New here? <Link to="/register">Create an account</Link>.</p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
