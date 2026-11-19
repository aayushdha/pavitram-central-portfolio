"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchTokenProfile,
  loginUser,
  registerUser,
  updateProfile as updateProfileApi,
  ApiError,
} from "@/lib/auth/api";
import {
  clearSession,
  getStoredUser,
  getToken,
  persistSession,
  persistUser,
} from "@/lib/auth/storage";
import type {
  AuthUser,
  LoginPayload,
  ProfileUpdatePayload,
  RegisterPayload,
  TokenProfile,
} from "@/lib/auth/types";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  tokenProfile: TokenProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenProfile, setTokenProfile] = useState<TokenProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const t = getToken();
    if (!t) {
      setTokenProfile(null);
      return;
    }
    try {
      const me = await fetchTokenProfile();
      setTokenProfile(me.user);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        clearSession();
        setUser(null);
        setToken(null);
        setTokenProfile(null);
      }
    }
  }, []);

  useEffect(() => {
    const t = getToken();
    const u = getStoredUser();
    setToken(t);
    setUser(u);
    if (t) {
      refreshProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshProfile]);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await loginUser(payload);
    persistSession(res.access_token, res.user);
    setToken(res.access_token);
    setUser(res.user);
    await refreshProfile();
  }, [refreshProfile]);

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await registerUser(payload);
      // Auto-login so user lands in dashboard with a token
      await login({ identifier: payload.email, password: payload.password });
    },
    [login],
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
    setTokenProfile(null);
  }, []);

  const updateProfile = useCallback(async (payload: ProfileUpdatePayload) => {
    try {
      const res = await updateProfileApi(payload);
      persistUser(res.user);
      setUser(res.user);
    } catch (err) {
      // If update endpoint is not ready, keep a local merge so UI still works
      if (err instanceof ApiError && (err.status === 404 || err.status === 405)) {
        const current = getStoredUser();
        if (!current) throw err;
        const merged = { ...current, ...payload };
        persistUser(merged);
        setUser(merged);
        return;
      }
      throw err;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      tokenProfile,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
    }),
    [user, token, tokenProfile, loading, login, register, logout, refreshProfile, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
