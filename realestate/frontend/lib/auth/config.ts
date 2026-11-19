/**
 * All environment-dependent URLs used by the auth layer, in one place.
 *
 * NEXT_PUBLIC_CENTRAL_AUTH_URL  → the shared "mainbackend" Pavitram Auth API.
 *   Only email + password signup/signin happen here (confirmed working via
 *   Postman) — deliberately no OTP, no Google. This project NEVER stores a
 *   password — it only ever stores the access_token this API hands back
 *   after a successful signup/signin.
 *
 *   IMPORTANT: the frontend does NOT call this URL directly — the browser
 *   was getting CORS-blocked doing so. Signup/signin instead go through
 *   THIS project's own backend (`/auth/signup`, `/auth/signin`), which
 *   forwards the request server-side (see `backend/src/auth-proxy` and
 *   `lib/auth/central-auth-client.ts`). This constant is kept only for
 *   documentation/reference and for the backend's own `.env`.
 *
 * NEXT_PUBLIC_API_BASE_URL      → THIS project's own NestJS backend
 *   (the `backend/` folder in this repo). Every real-estate feature
 *   (properties, projects, leads, wishlist, admin, ...) — AND NOW ALSO
 *   signup/signin — goes through here. Authenticated calls send
 *   `Authorization: Bearer <access_token>`; this backend verifies that
 *   token against the central auth API itself, also server-side.
 *
 * Both have safe production fallbacks so the app still works if someone
 * forgets to create a `.env.local` file, but you should create one for
 * local development (see `.env.local.example`).
 */
export const CENTRAL_AUTH_BASE_URL =
  (process.env.NEXT_PUBLIC_CENTRAL_AUTH_URL ?? "https://mainbackend.pavitramindia.com/api/v1").replace(
    /\/+$/,
    "",
  );

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://backend.pavitramindia.com/api/v1"
).replace(/\/+$/, "");

/** Cookie + localStorage key the access token is kept under. */
export const TOKEN_STORAGE_KEY = "pv_access_token";
