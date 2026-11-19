"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, ApiError, ApiUser, PortalRole, SelfServiceRole } from "./api-client";

const TOKEN_KEY = "jobportal_token";
const USER_KEY = "jobportal_user";

interface AuthContextValue {
  user: ApiUser | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<ApiUser>;
  register: (data: { name?: string; email: string; password: string; phone: string }) => Promise<ApiUser>;
  setPortalRole: (role: SelfServiceRole) => Promise<ApiUser>;
  updateProfile: (data: Parameters<typeof api.updateProfile>[1]) => Promise<ApiUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Where a role lands after login. Keeps this mapping in exactly one place. */
export function dashboardPathForRole(role: PortalRole): string {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "EMPLOYER") return "/employer/dashboard";
  return "/seeker/dashboard";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    let storedUser: ApiUser | null = null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      storedUser = raw ? (JSON.parse(raw) as ApiUser) : null;
    } catch {
      // Corrupt saved session — treat as logged out instead of crashing the whole app.
    }

    /* Reading the saved session once on mount is the intended use of an effect here (localStorage doesn't exist during SSR). */
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!storedToken || !storedUser) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setLoading(false);
      return;
    }
    setToken(storedToken);
    setUser(storedUser);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Revalidate in the background. Only drop the session when the server actually rejects it;
    // a network blip or server restart must not log people out.
    api
      .me(storedToken)
      .then(({ user: fresh }) => {
        setUser(fresh);
        localStorage.setItem(USER_KEY, JSON.stringify(fresh));
      })
      .catch((err) => {
        if (err instanceof ApiError && (err.statusCode === 401 || err.statusCode === 403)) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function persist(res: { accessToken: string; user: ApiUser }) {
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setToken(res.accessToken);
    setUser(res.user);
  }

  async function login(identifier: string, password: string) {
    const res = await api.login({ identifier, password });
    persist(res);
    return res.user;
  }

  async function register(data: { name?: string; email: string; password: string; phone: string }) {
    const res = await api.register(data);
    persist(res);
    return res.user;
  }

  async function setPortalRole(role: SelfServiceRole) {
    if (!token) throw new Error("Not authenticated");
    const { user: updated } = await api.updateRole(token, role);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
    return updated;
  }

  async function updateProfile(data: Parameters<typeof api.updateProfile>[1]) {
    if (!token) throw new Error("Not authenticated");
    const { user: updated } = await api.updateProfile(token, data);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
    return updated;
  }

  function logout() {
    if (token) {
      api.logout(token).catch(() => {
        // Best-effort — even if this fails (session already gone), still
        // clear local state so the UI never gets stuck "logged in".
      });
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, setPortalRole, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
