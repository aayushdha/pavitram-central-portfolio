"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import * as centralAuth from "./central-auth-client";
import { extractToken } from "./central-auth-client";
import { getMe, addRoles, updateProfile } from "../api/users";
import { clearToken, getToken, setToken } from "./token-storage";
import { ApiRequestError, LocalUser, RealRole } from "./types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: LocalUser | null;
  /** True once the central account is ADMIN/SUPER_ADMIN (mirrored onto the local ADMIN role too). */
  isAdmin: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<LocalUser>;
  signup: (input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    /** Role to add on top of the default SEEKER role right after signup. */
    role?: Extract<RealRole, "OWNER" | "PROVIDER">;
  }) => Promise<LocalUser>;
  logout: () => void;
  refreshUser: () => Promise<LocalUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Where to send someone right after they authenticate, based on their roles. */
export function primaryDashboardPath(user: LocalUser | null): string {
  if (!user) return "/login";
  if (user.roles.includes("ADMIN")) return "/dashboard/admin";
  if (user.roles.includes("OWNER")) return "/dashboard/owner";
  if (user.roles.includes("PROVIDER")) return "/dashboard/provider";
  return "/dashboard/seeker";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<LocalUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(async (): Promise<LocalUser | null> => {
    const token = getToken();
    if (!token) {
      setStatus("unauthenticated");
      setUser(null);
      return null;
    }
    try {
      const { user: me } = await getMe();
      setUser(me);
      setStatus("authenticated");
      return me;
    } catch {
      clearToken();
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial async session check on mount, not a synchronous setState
    void hydrate();
  }, [hydrate]);

  const clearError = useCallback(() => setError(null), []);

  const finishWithToken = useCallback(
    async (accessToken: string, role?: Extract<RealRole, "OWNER" | "PROVIDER">) => {
      setToken(accessToken);
      let { user: me } = await getMe();
      if (role && !me.roles.includes(role)) {
        const res = await addRoles([role]);
        me = res.user;
      }
      setUser(me);
      setStatus("authenticated");
      return me;
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        const res = await centralAuth.signin({ email, password });
        const token = extractToken(res);
        if (!token) {
          throw new ApiRequestError(
            "The authentication service didn't return an access token. Please contact support.",
            502,
          );
        }
        return await finishWithToken(token);
      } catch (err) {
        const message = err instanceof ApiRequestError ? err.message : "Login failed. Please try again.";
        setError(message);
        throw err;
      }
    },
    [finishWithToken],
  );

  const signup = useCallback(
    async (input: {
      name: string;
      email: string;
      phone?: string;
      password: string;
      role?: Extract<RealRole, "OWNER" | "PROVIDER">;
    }) => {
      setError(null);
      try {
        const res = await centralAuth.signup({
          name: input.name,
          email: input.email,
          phone: input.phone,
          password: input.password,
        });
        const token = extractToken(res);
        if (!token) {
          throw new ApiRequestError(
            "The authentication service didn't return an access token. Please contact support.",
            502,
          );
        }
        const me = await finishWithToken(token, input.role);
        // The central API doesn't store a name (confirmed via testing), so
        // save it on this project's own profile right after account creation.
        if (input.name.trim() && !me.name) {
          try {
            const updated = await updateProfile({ name: input.name.trim() });
            setUser(updated.user);
            return updated.user;
          } catch {
            // Non-fatal — the account still exists and is logged in; the
            // person can set their name later from their profile.
          }
        }
        return me;
      } catch (err) {
        const message = err instanceof ApiRequestError ? err.message : "Registration failed. Please try again.";
        setError(message);
        throw err;
      }
    },
    [finishWithToken],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAdmin: !!user?.roles.includes("ADMIN"),
      error,
      clearError,
      login,
      signup,
      logout,
      refreshUser: hydrate,
    }),
    [status, user, error, clearError, login, signup, logout, hydrate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
