/**
 * GET /status — open https://<your-site>/status in a browser to see which link of
 *   browser -> frontend -> backend -> (database, Central Auth)
 * is broken. Returns only booleans / short error codes, never secrets.
 */
export const dynamic = "force-dynamic";

const BACKEND = (process.env.BACKEND_INTERNAL_URL || "http://jobportal-backend:4000").replace(/\/+$/, "");

type Probe = { ok: boolean; status?: number; ms: number; error?: string; json?: unknown };

async function probe(path: string): Promise<Probe> {
  const t0 = Date.now();
  try {
    const r = await fetch(`${BACKEND}${path}`, { cache: "no-store", signal: AbortSignal.timeout(12000) });
    let json: unknown;
    try {
      json = await r.json();
    } catch {
      /* not JSON */
    }
    return { ok: r.ok, status: r.status, ms: Date.now() - t0, json };
  } catch (e) {
    const err = e as { cause?: { code?: string }; name?: string; message?: string };
    return { ok: false, ms: Date.now() - t0, error: err.cause?.code || err.name || err.message || "ERROR" };
  }
}

function diagnose(health: Probe, deep: Probe): string {
  if (!health.ok) {
    const code = health.error;
    if (code === "ENOTFOUND" || code === "EAI_AGAIN")
      return "The frontend container cannot find the backend container by name (jobportal-backend). They are not on the same docker network, or the backend container does not exist. Run: docker compose -f docker-compose.prod.yml up -d";
    if (code === "ECONNREFUSED" || code === "ECONNRESET")
      return "The backend container exists but nothing is listening on port 4000 — it has crashed or is restarting. Run: docker logs --tail 60 pavitram-jobportal-backend (usually a wrong DATABASE_URL or a missing env value).";
    if (code === "TimeoutError" || code === "AbortError")
      return "The backend container did not answer within 12 s. Check VPS load (docker stats) and: docker logs --tail 60 pavitram-jobportal-backend";
    if (health.status) return `The backend answered /api/v1/health with HTTP ${health.status}. Check: docker logs --tail 60 pavitram-jobportal-backend`;
    return `Cannot reach the backend (${code}).`;
  }
  const d = deep.json as
    | { database?: { ok?: boolean; error?: string }; centralAuth?: { ok?: boolean; error?: string; status?: number }; jwtSecretConfigured?: boolean }
    | undefined;
  if (!deep.ok || !d) return "Backend is up, but it is an older version without the deep check. Deploy the latest code.";
  if (!d.database?.ok)
    return `Backend is up but CANNOT REACH THE DATABASE (${d.database?.error}). This is why signup/login return 500. Check DATABASE_URL in the VPS .env (special characters in the password must be URL-encoded: @ -> %40, * -> %2A) and that Postgres is running on the host port.`;
  if (!d.centralAuth?.ok)
    return `Backend is up but CANNOT REACH CENTRAL AUTH (${d.centralAuth?.error ?? "HTTP " + d.centralAuth?.status}). Check CENTRAL_AUTH_BASE_URL and that the VPS can open https://mainbackend.pavitramindia.com`;
  if (d.jwtSecretConfigured === false)
    return "Everything is reachable, BUT JWT_SECRET is missing/too short/placeholder. Set a real value (openssl rand -hex 32) in the VPS .env and redeploy.";
  return "All good: frontend -> backend -> database -> Central Auth are all reachable.";
}

let cache: { at: number; body: unknown } | undefined;

export async function GET() {
  if (cache && Date.now() - cache.at < 5000) return Response.json(cache.body, { headers: { "Cache-Control": "no-store" } });
  const [health, deep] = await Promise.all([probe("/api/v1/health"), probe("/api/v1/health/deep")]);
  const body = { frontend: "ok", backendUrl: BACKEND, backendHealth: health, backendDeep: deep, diagnosis: diagnose(health, deep) };
  cache = { at: Date.now(), body };
  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}
