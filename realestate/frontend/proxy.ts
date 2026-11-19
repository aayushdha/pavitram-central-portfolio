import { NextRequest, NextResponse } from "next/server";
import { TOKEN_STORAGE_KEY } from "./lib/auth/config";

/**
 * Runs on the Edge before any `/dashboard/**` page is rendered. This is what
 * actually fixes "the dashboard is reachable without logging in" — no page
 * inside `/dashboard` can render at all unless the auth cookie is present.
 *
 * This is a fast, cookie-presence check only (Edge middleware can't safely
 * call the central auth API on every request without adding latency to
 * every navigation). The real verification — is the token still valid, what
 * roles does this account actually have — happens right after, via
 * `AuthProvider` + `RoleGuard` on the client, which call this backend's
 * `GET /users/me` (which itself calls the central `/auth/me`). A stolen/
 * expired cookie gets bounced back to `/login` by `RoleGuard` immediately;
 * this proxy's job is just to stop the page from ever flashing on screen
 * for a fully logged-out visitor. (Next.js 16 renamed `middleware.ts` to
 * `proxy.ts` — same mechanism, new name/file.)
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_STORAGE_KEY)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
