import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { changePassword, fetchMe, loginAccount, logoutAccount, refreshSession, registerAccount } from "../api/authApi.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    refreshSession()
      .then((next) => setUser(next))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo(() => ({
    user,
    ready,
    async register(payload) {
      const next = await registerAccount(payload);
      setUser(next);
      return next;
    },
    async login(payload) {
      const next = await loginAccount(payload);
      setUser(next);
      return next;
    },
    async logout() {
      await logoutAccount();
      setUser(null);
    },
    async reload() {
      const next = await fetchMe();
      setUser(next);
      return next;
    },
    async changePassword(payload) {
      const next = await changePassword(payload);
      setUser(next);
      return next;
    }
  }), [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
