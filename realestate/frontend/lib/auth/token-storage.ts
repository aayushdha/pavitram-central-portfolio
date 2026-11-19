/**
 * Where the central-auth `access_token` lives on the client.
 *
 * It is written to BOTH `localStorage` (so client components / the fetch
 * wrapper can read it synchronously) AND a plain cookie (so `middleware.ts`,
 * which runs on the Edge runtime and has no access to `localStorage`, can
 * check "is someone logged in?" before a `/dashboard/*` page ever renders).
 *
 * The cookie only ever holds the opaque token string — never a password —
 * and is not marked httpOnly because it must be written from client-side JS
 * right after signup/signin. This mirrors how the token is already handled
 * by every API call in this project (`Authorization: Bearer <token>`), it is
 * just also mirrored into a cookie for the middleware's benefit.
 */
import { TOKEN_STORAGE_KEY } from "./config";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    /* localStorage unavailable (private mode etc.) — cookie still works */
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${TOKEN_STORAGE_KEY}=${encodeURIComponent(token)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearToken() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  document.cookie = `${TOKEN_STORAGE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
}
