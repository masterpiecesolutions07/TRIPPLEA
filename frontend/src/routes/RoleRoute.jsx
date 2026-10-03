import { useAuth } from "../context/AuthContext.jsx";

export function RoleRoute({ allow, children }) {
  const { user, ready } = useAuth();
  if (!ready) return <p className="gate">Checking your session…</p>;
  if (!user || !allow.includes(user.role)) {
    return (
      <main className="gate card">
        <h1>This area is closed</h1>
        <p className="lede">Your account does not have access here.</p>
      </main>
    );
  }
  return children;
}
