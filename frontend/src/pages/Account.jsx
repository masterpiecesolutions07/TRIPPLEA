import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function Account() {
  const { user, logout } = useAuth();
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: "40rem" }}>
        <div className="card" style={{ padding: "1.2rem" }}>
          <p className="eyebrow">{user?.role}</p>
          <h1>Your account</h1>
          <p className="lede">Signed in as {user?.name} ({user?.email}).</p>
          <p className="note">You are signed in. Your dashboard holds your application and any notes from the mentorship.</p>
          <div className="cluster">
            <button className="btn btn--primary" type="button" onClick={logout}>Log out</button>
            <Link className="btn btn--ghost" to="/">Back home</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
