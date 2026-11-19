/**
 * Generic authenticated fetch wrapper for THIS project's own NestJS backend
 * (`API_BASE_URL`, i.e. the `backend/` folder in this repo — properties,
 * projects, leads, wishlist, admin, etc). Every call attaches
 * `Authorization: Bearer <access_token>`, where the token is the one
 * obtained earlier from the central auth API (see `lib/auth/central-auth-client.ts`).
 *
 * The backend wraps every response in `{ success, ... }` (see
 * `TransformInterceptor`) and every error in the shape of `ApiError` (see
 * `HttpExceptionFilter`) — both already typed in `lib/auth/types.ts`.
 */
import { API_BASE_URL } from "../auth/config";
import { getToken, clearToken } from "../auth/token-storage";
import { ApiError, ApiRequestError } from "../auth/types";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** Plain object body — JSON-encoded automatically. Omit for GET/DELETE. */
  body?: unknown;
  /** Skip attaching the Authorization header (for public endpoints). */
  skipAuth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, skipAuth, headers, ...rest } = options;
  const token = skipAuth ? null : getToken();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiRequestError(
      "Could not reach the Pavitram server. Check your connection and try again.",
      0,
    );
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    /* empty/non-JSON body, e.g. 204 No Content */
  }

  if (!response.ok) {
    if (response.status === 401) {
      // Token is invalid/expired/account deactivated — drop it so the app
      // doesn't keep retrying with dead credentials.
      clearToken();
    }
    const err = payload as ApiError | null;
    const message = Array.isArray(err?.message)
      ? err!.message.join(", ")
      : err?.message ?? `Request failed (${response.status})`;
    throw new ApiRequestError(message, response.status, err ?? undefined);
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
