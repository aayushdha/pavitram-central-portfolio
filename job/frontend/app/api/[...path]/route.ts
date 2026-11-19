import type { NextRequest } from "next/server";

/**
 * Same-origin API proxy: the browser calls https://<site>/api/v1/... and this handler forwards it to the
 * backend container over the private docker network. Compared with a plain `rewrites()` entry it
 *  - reads BACKEND_INTERNAL_URL at RUNTIME (no rebuild needed to change it),
 *  - waits up to 60 s (signup talks to Central Auth twice),
 *  - answers with a clear JSON 502/504 + a log line when the backend can't be reached,
 *    instead of Next's empty "500 Internal Server Error".
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BACKEND = (
  process.env.BACKEND_INTERNAL_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "http://jobportal-backend:4000")
).replace(/\/+$/, "");

const HOP_BY_HOP = new Set([
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer",
  "transfer-encoding", "upgrade", "host", "content-length",
]);

async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const target = `${BACKEND}/api/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  });

  const hasBody = !["GET", "HEAD"].includes(req.method);
  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
      redirect: "manual",
      signal: AbortSignal.timeout(60_000),
    });

    const out = new Headers();
    upstream.headers.forEach((value, key) => {
      // fetch() already decoded the body, so the original encoding/length headers no longer apply
      if (!HOP_BY_HOP.has(key.toLowerCase()) && key.toLowerCase() !== "content-encoding") out.set(key, value);
    });
    return new Response(upstream.status === 204 || upstream.status === 304 ? null : upstream.body, {
      status: upstream.status,
      headers: out,
    });
  } catch (err) {
    const e = err as { name?: string; cause?: { code?: string }; message?: string };
    const code = e.cause?.code || e.name || "ERROR";
    console.error(`[api-proxy] ${req.method} ${target} failed: ${code} ${e.message ?? ""}`);
    const timedOut = e.name === "TimeoutError" || e.name === "AbortError";
    return Response.json(
      {
        message: timedOut
          ? "The server took too long to respond. Please try again."
          : "Our server is not reachable right now. Please try again in a minute.",
        error: "BackendUnreachable",
        detail: code,
      },
      { status: timedOut ? 504 : 502 }
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE, proxy as OPTIONS, proxy as HEAD };
