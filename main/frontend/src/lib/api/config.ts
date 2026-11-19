/**
 * Shared config for the Pavitram CMS/content API.
 * Uses the same NEXT_PUBLIC_API_BASE_URL as src/lib/auth/api.ts so the whole
 * frontend points at a single backend.
 */
export function apiBase(): string {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function parseError(res: Response) {
  let data: unknown = null;
  let message = res.statusText || "Request failed";
  try {
    data = await res.json();
    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      if (typeof obj.message === "string") message = obj.message;
      else if (Array.isArray(obj.message) && obj.message.length) message = String(obj.message[0]);
      else if (typeof obj.error === "string") message = obj.error;
    }
  } catch {
    // ignore
  }
  throw new ApiError(message, res.status, data);
}

/**
 * Public, unauthenticated GET used for CMS content on the live site.
 * Always resolves — never throws — so a page keeps rendering (with its
 * local fallback data) even if the backend is briefly unreachable.
 * Uses `cache: "no-store"` so Super Admin edits show up immediately.
 */
export async function publicGet<T>(path: string): Promise<T | null> {
  const base = apiBase();
  if (!base) return null;
  try {
    const res = await fetch(`${base}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Public, unauthenticated POST used for forms (contact, etc). Never throws —
 * returns a discriminated result so the UI can show a friendly message either way.
 */
export async function publicPost<T>(
  path: string,
  body: unknown,
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  const base = apiBase();
  if (!base) {
    return { ok: false, message: "Service is temporarily unavailable. Please try again shortly." };
  }
  try {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const raw = json && typeof json === "object" ? (json as Record<string, unknown>) : null;
      let message = "Something went wrong. Please try again.";
      if (raw) {
        if (typeof raw.message === "string") message = raw.message;
        else if (Array.isArray(raw.message) && raw.message.length) message = String(raw.message[0]);
        else if (typeof raw.error === "string") message = raw.error;
      }
      return { ok: false, message };
    }
    return { ok: true, data: json as T };
  } catch {
    return { ok: false, message: "Network error. Please check your connection and try again." };
  }
}

/** Authenticated request used by the Super Admin panel. Throws ApiError on failure. */
export async function authedRequest<T>(
  path: string,
  init: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${apiBase()}${path}`, { ...init, headers, cache: "no-store" });
  if (!res.ok) await parseError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
