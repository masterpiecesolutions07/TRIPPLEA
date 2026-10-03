import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
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
      setError(err.response?.data?.message || "Could not sign in. Check that the API and MongoDB are running.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Log in</h1>
          <p className="lede">Use the email and password from your registration.</p>
        </div>
      </section>
      <section className="section">
        <div className="container" style={{ maxWidth: "36rem" }}>
          <div className="auth-card card">
            <form className="form" onSubmit={submit}>
              {error ? <p className="form-summary" role="alert">{error}</p> : null}
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" autoComplete="username" required value={form.email} onChange={update} />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={update} />
              </div>
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
