import type {
  LoginPayload,
  LoginResponse,
  MeResponse,
  ProfileFormPayload,
  ProfileFormResponse,
  ProfileUpdatePayload,
  RegisterPayload,
  RegisterResponse,
  AuthUser,
} from "./types";
import { getToken } from "./storage";

// Re-export for SSO helpers that need the live token after persist
export { getToken };

function apiBase() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  if (!base) {
    throw new Error(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL in .env.local",
    );
  }
  return base;
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
      // backend.pavitramindia.com shape: { success, statusCode, message, error }
      if (typeof obj.message === "string") message = obj.message;
      else if (typeof obj.error === "string") message = obj.error;
      else if (Array.isArray(obj.errors) && obj.errors.length) {
        message = String(obj.errors[0]);
      }
    }
  } catch {
    // ignore
  }
  throw new ApiError(message, res.status, data);
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  opts: { skipAuth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (!opts.skipAuth) {
    const token = getToken();
    // Same auth style as realestate app (axios interceptor → Authorization: Bearer <pavitram_token>)
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) await parseError(res);
  return res.json() as Promise<T>;
}

export function registerUser(payload: RegisterPayload) {
  return request<RegisterResponse>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload) {
  return request<LoginResponse>("/api/v1/auth/signin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchTokenProfile() {
  return request<MeResponse>("/api/v1/auth/me", { method: "GET" });
}

/** Profile update — path configurable if backend differs. */
export function updateProfile(payload: ProfileUpdatePayload) {
  const path = process.env.NEXT_PUBLIC_AUTH_PROFILE_PATH || "/api/v1/auth/profile";
  return request<{ message: string; user: AuthUser }>(path, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * "Join the Community" membership form. Public endpoint — anyone can submit
 * this, logged in or not. No auth token is attached.
 */
export function submitProfileForm(payload: ProfileFormPayload) {
  return request<ProfileFormResponse>(
    "/api/v1/users/profile-form",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    { skipAuth: true },
  );
}

/**
 * Realestate reads localStorage key `pavitram_token` and sends:
 *   Authorization: Bearer <token>
 * We hand off the token via ?pavitram_token= so RE can store it (or already does).
 */
export function getPropertiesServiceUrl(token?: string | null) {
  const base =
    process.env.NEXT_PUBLIC_PROPERTIES_URL || "https://realestate.pavitramindia.com/";
  const url = new URL(base);
  if (token) {
    const param = process.env.NEXT_PUBLIC_SSO_TOKEN_PARAM || "pavitram_token";
    url.searchParams.set(param, token);
  }
  return url.toString();
}

export function openPropertiesWithBearer(token?: string | null) {
  if (typeof window === "undefined") return;
  // Ensure current tab also keeps the shared key before leaving
  if (token) {
    localStorage.setItem("pavitram_token", token);
  }
  window.location.href = getPropertiesServiceUrl(token ?? getToken());
}
