/**
 * Empty (the default) = same origin: the browser calls /api/v1/... on the site itself and Next.js
 * forwards it to the backend (see rewrites in next.config.ts). That needs no separate API domain,
 * SSL certificate or CORS setup. Set NEXT_PUBLIC_API_BASE_URL only to call a backend on another origin.
 */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

export type PortalRole = "SEEKER" | "EMPLOYER" | "ADMIN";
export type SelfServiceRole = "SEEKER" | "EMPLOYER";

export interface ApiUser {
  id: string;
  centralUserId: string;
  email: string;
  phone: string | null;
  name: string | null;
  avatarUrl: string | null;
  role: PortalRole;
  centralRole: string;
  accountStatus: string;
  kycStatus: string;
  isOnboarded: boolean;
  address: string | null;
  city: string | null;
  state: string | null;
  profession: string | null;
  designation: string | null;
  organization: string | null;
  agencyName: string | null;
  reraNumber: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: string;
  user: ApiUser;
}

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/v1${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (err) {
    // Shown in the browser console (F12) so a failing request can be diagnosed.
    console.error(`[api] ${options.method ?? "GET"} ${API_BASE}/api/v1${path} failed before any response:`, err);
    throw new ApiError("Can't reach the server right now. Please check your internet connection and try again.", 0);
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(", ") : body?.message;
    if (!message && res.status >= 500) {
      throw new ApiError(`The server is temporarily unavailable (error ${res.status}). Please try again in a minute.`, res.status);
    }
    throw new ApiError(message || `Request failed (${res.status})`, res.status);
  }

  return body as T;
}

export const api = {
  register(data: { name?: string; email: string; password: string; phone: string; role?: SelfServiceRole }) {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  login(data: { identifier: string; password: string }) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  me(token: string) {
    return request<{ user: ApiUser }>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  logout(token: string) {
    return request<{ message: string }>("/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  updateProfile(
    token: string,
    data: { name?: string; city?: string; state?: string; address?: string; organization?: string; designation?: string; bio?: string }
  ) {
    return request<{ user: ApiUser; centralSynced: boolean }>("/users/profile", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },
  updateRole(token: string, role: SelfServiceRole) {
    return request<{ user: ApiUser }>("/users/role", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ role }),
    });
  },
};
