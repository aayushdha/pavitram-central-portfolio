import type { AuthUser } from "./types";

/** Same keys as realestate.pavitramindia.com — axios there sends Authorization: Bearer <token> */
const TOKEN_KEY = "pavitram_token";
const USER_KEY = "pavitram_re_profile";
const LEGACY_TOKEN_KEY = "pavitram_access_token";
const LEGACY_USER_KEY = "pavitram_auth_user";
const COOKIE_NAME = "pavitram_token";

function migrateLegacyKeys() {
  if (typeof window === "undefined") return;
  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
  if (legacyToken && !localStorage.getItem(TOKEN_KEY)) {
    localStorage.setItem(TOKEN_KEY, legacyToken);
  }
  const legacyUser = localStorage.getItem(LEGACY_USER_KEY);
  if (legacyUser && !localStorage.getItem(USER_KEY)) {
    localStorage.setItem(USER_KEY, legacyUser);
  }
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  migrateLegacyKeys();
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  migrateLegacyKeys();
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function setSharedCookie(token: string | null) {
  if (typeof document === "undefined") return;

  const host = window.location.hostname;
  const isPavitram = host === "pavitramindia.com" || host.endsWith(".pavitramindia.com");
  const maxAge = token ? 60 * 60 * 24 * 7 : 0;
  const value = token ?? "";
  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;

  if (isPavitram) {
    // Shared cookie for *.pavitramindia.com (realestate can also read if needed)
    document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Domain=.pavitramindia.com${secure}`;
  }

  // Clear old cookie name if present
  document.cookie = `access_token=; Path=/; Max-Age=0`;
  document.cookie = `access_token=; Path=/; Max-Age=0; Domain=.pavitramindia.com`;
}

export function persistSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setSharedCookie(token);
}

export function persistUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  setSharedCookie(null);
  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0`;
    document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; Domain=.pavitramindia.com`;
  }
}
