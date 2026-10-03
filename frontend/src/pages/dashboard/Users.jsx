import { useEffect, useState } from "react";
import { createMentor, getUsers, setUserRole } from "../../api/dashboardApi.js";

const ROLES = ["student", "mentor", "admin"];

export function Users() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  function load() {
    getUsers().then(setItems).catch((err) => setError(err.response?.data?.message || "Could not load users."));
  }

  useEffect(() => { load(); }, []);

  return (
    <>
      <h1>Users and roles</h1>
      {error ? <p className="form-summary">{error}</p> : null}
      {items.length === 0 ? <p className="note">No accounts yet. Seed the admin, or wait for a student to register.</p> : (
        <div className="table-wrap panel">
          <table className="dash-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>
                    <select value={item.role} aria-label={`Role for ${item.email}`} onChange={(event) => setUserRole(item.id, event.target.value).then(load)}>
                      {ROLES.map((role) => <option key={role}>{role}</option>)}
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

export function Mentors() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const item = await createMentor(form);
      setMessage(`${item.name} can sign in and will be asked to change the password.`);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the mentor.");
    }
  }

  return (
    <>
      <h1>Mentor accounts</h1>
      <form className="panel dash-form" onSubmit={submit}>
        {error ? <p className="form-summary">{error}</p> : null}
        {message ? <p className="note">{message}</p> : null}
        <div className="field"><label htmlFor="mentor-name">Name</label><input id="mentor-name" name="name" required value={form.name} onChange={update} /></div>
        <div className="field"><label htmlFor="mentor-email">Email</label><input id="mentor-email" name="email" type="email" required value={form.email} onChange={update} /></div>
        <div className="field"><label htmlFor="mentor-password">Temporary password</label><input id="mentor-password" name="password" type="password" required value={form.password} onChange={update} /></div>
        <p className="note">At least 8 characters, with upper case, lower case, and a number.</p>
        <button className="btn btn--primary" type="submit">Create mentor</button>
      </form>
    </>
  );
}
