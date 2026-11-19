/**
 * Client for signup/signin — goes through THIS PROJECT'S OWN backend
 * (`API_BASE_URL` + `/auth/signup` / `/auth/signin`), which in turn forwards
 * the request server-side to the central Pavitram Auth API
 * (`https://mainbackend.pavitramindia.com/api/v1`).
 *
 * Why not call the central auth API directly from the browser: it was
 * returning a generic "failed to fetch" here even though the exact same
 * request works fine from Postman — the textbook signature of the browser
 * blocking it via CORS (the central service's CORS allow-list apparently
 * covers at least one other site's origin, but not this one). A
 * server-to-server call is never subject to browser CORS, so routing
 * through `backend/src/auth-proxy` sidesteps the problem entirely without
 * needing the central auth service's CORS config changed. See that module
 * for the actual forwarding logic (including the `/auth/signin` →
 * `/auth/login` fallback and the `name`-field handling).
 *
 * There is deliberately NO OTP and NO Google login here — only the single
 * email + password flow the central API is confirmed to support.
 */
import { API_BASE_URL } from "./config";
import { ApiRequestError, CentralAuthResponse } from "./types";

async function authFetch<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiRequestError(
      "Could not reach the server. Check your connection and try again.",
      0,
    );
  }

  let responseBody: unknown = null;
  try {
    responseBody = await response.json();
  } catch {
    /* empty/non-JSON body */
  }

  if (!response.ok) {
    const message = extractErrorMessage(responseBody, response.status);
    throw new ApiRequestError(message, response.status);
  }

  return responseBody as T;
}

/** Pulls the token out of a central-auth response regardless of which field name it used. */
export function extractToken(res: CentralAuthResponse | null | undefined): string | null {
  return res?.access_token ?? res?.accessToken ?? res?.token ?? null;
}

export interface SignupInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface SigninInput {
  email: string;
  password: string;
}

/**
 * `name` is deliberately NOT sent — confirmed via Postman that the working
 * signup request only has `{ email, password, phone }`. It's saved to this
 * project's own profile right after account creation instead (see
 * `AuthProvider.signup()`, which calls `updateProfile({ name })`).
 */
export async function signup(input: SignupInput): Promise<CentralAuthResponse> {
  return authFetch<CentralAuthResponse>("/auth/signup", {
    email: input.email,
    password: input.password,
    phone: input.phone,
  });
}

export async function signin(input: SigninInput): Promise<CentralAuthResponse> {
  return authFetch<CentralAuthResponse>("/auth/signin", input);
}

function extractErrorMessage(body: unknown, status: number): string {
  const message = (body as { message?: string | string[] } | null)?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message ?? `Authentication service error (${status})`;
}
