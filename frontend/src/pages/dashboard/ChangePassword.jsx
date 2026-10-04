import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { feedbackMessage } from "../../utils/feedback.js";
import { homePath } from "../../utils/homePath.js";

export function ChangePassword() {
  const { changePassword, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [error, setError] = useState("");

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const next = await changePassword(form);
      navigate(homePath({ ...next, mustChangePassword: false }), { replace: true });
    } catch (err) {
      setError(feedbackMessage(err, "Could not change the password. Please try again."));
    }
  }

  return (
    <>
      <h1>Change password</h1>
      {user?.mustChangePassword ? <p className="lede">Choose a new password before you use the dashboard.</p> : null}
      <form className="panel dash-form" onSubmit={submit}>
        {error ? <p className="form-summary">{error}</p> : null}
        <div className="field"><label htmlFor="currentPassword">Current password</label><input id="currentPassword" name="currentPassword" type="password" required value={form.currentPassword} onChange={update} /></div>
        <div className="field"><label htmlFor="newPassword">New password</label><input id="newPassword" name="newPassword" type="password" required value={form.newPassword} onChange={update} /></div>
        <p className="note">At least 8 characters, with upper case, lower case, and a number.</p>
        <button className="btn btn--primary" type="submit">Save password</button>
      </form>
    </>
  );
}
