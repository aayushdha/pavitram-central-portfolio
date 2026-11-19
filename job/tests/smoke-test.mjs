#!/usr/bin/env node
/**
 * JobConnect — full-site smoke test. No dependencies, needs Node 18+.
 *
 *   node tests/smoke-test.mjs
 *
 * Optional environment variables:
 *   FRONTEND_URL   default https://jobportal.pavitramindia.com
 *   API_URL        default = FRONTEND_URL (the site forwards /api/* to the backend itself).
 *                  Set it only if you call a backend on a separate domain.
 *   TEST_EMAIL / TEST_PASSWORD   an EXISTING account -> runs the logged-in checks (no new account is created)
 *   TEST_SIGNUP=1                create a brand-new throwaway account and run the logged-in checks
 *                                (WARNING: this creates a real account in the shared Pavitram Central Auth)
 *
 * Exit code: 0 = everything passed, 1 = at least one check failed.
 */

const FRONTEND = (process.env.FRONTEND_URL || "https://jobportal.pavitramindia.com").replace(/\/+$/, "");
const API = (process.env.API_URL || FRONTEND).replace(/\/+$/, "");
const SAME_ORIGIN = new URL(API).origin === new URL(FRONTEND).origin;
const V1 = `${API}/api/v1`;
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;
const SIGNUP = process.env.TEST_SIGNUP === "1";

const PAGES = [
  "/", "/login", "/signup", "/onboarding",
  "/seeker/dashboard", "/seeker/jobs", "/seeker/jobs/1", "/seeker/search", "/seeker/applications",
  "/seeker/job-alerts", "/seeker/resume-builder", "/seeker/assessments", "/seeker/interview-prep",
  "/seeker/learning", "/seeker/messages", "/seeker/notifications", "/seeker/network", "/seeker/people",
  "/seeker/groups", "/seeker/companies", "/seeker/companies/1", "/seeker/salary-insights",
  "/seeker/profile", "/seeker/profile-views", "/seeker/premium", "/seeker/settings",
  "/employer/dashboard", "/employer/jobs", "/employer/candidates", "/employer/talent-pool",
  "/employer/messages", "/employer/analytics", "/employer/billing", "/employer/company",
  "/admin/dashboard", "/admin/users", "/admin/moderation", "/admin/revenue", "/admin/settings",
];

// ───────────────────────── tiny test harness ─────────────────────────
const tty = process.stdout.isTTY;
const c = (code, s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
const stats = { pass: 0, fail: 0, warn: 0, skip: 0 };
const failures = [];

function report(kind, name, detail = "") {
  stats[kind]++;
  const tag = { pass: c(32, "PASS"), fail: c(31, "FAIL"), warn: c(33, "WARN"), skip: c(90, "SKIP") }[kind];
  console.log(`  ${tag}  ${name}${detail ? c(90, "  — " + detail) : ""}`);
  if (kind === "fail") failures.push(`${name}${detail ? " — " + detail : ""}`);
}
const section = (t) => console.log(`\n${c(1, t)}`);

async function check(name, fn) {
  try {
    const r = await fn();
    if (r === true || r === undefined) report("pass", name);
    else if (typeof r === "string") report("pass", name, r);
    else if (r && r.warn) report("warn", name, r.warn);
    else if (r && r.skip) report("skip", name, r.skip);
    else report("fail", name, String(r?.fail ?? r));
  } catch (e) {
    report("fail", name, e?.cause?.code || e?.message || String(e));
  }
}
const expect = (cond, msg) => { if (!cond) throw new Error(msg); };

async function http(url, { method = "GET", headers = {}, body, redirect = "follow", timeout = 25000 } = {}) {
  const t0 = Date.now();
  const res = await fetch(url, {
    method,
    redirect,
    headers: { ...(body !== undefined ? { "content-type": "application/json" } : {}), ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeout),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, headers: res.headers, text, json, ms: Date.now() - t0 };
}

// ───────────────────────── 1. BACKEND (public) ─────────────────────────
async function backendPublic() {
  section(`1. Backend API  (${API})`);

  await check("GET /health returns status ok", async () => {
    const r = await http(`${V1}/health`);
    expect(
      r.status === 200,
      `HTTP ${r.status}` +
        (SAME_ORIGIN ? " — the frontend cannot reach the backend container: check `docker ps` (backend Up?) and `docker logs pavitram-jobportal-backend`" : "")
    );
    expect(r.json?.status === "ok", `body: ${r.text.slice(0, 80)}`);
    return `${r.ms} ms`;
  });

  await check("Deep health: backend can reach the database and Central Auth", async () => {
    const r = await http(`${V1}/health/deep`);
    if (r.status === 404) return { warn: "backend is older than this version (no /health/deep) — deploy the latest code" };
    expect(r.status === 200, `HTTP ${r.status}`);
    const d = r.json || {};
    expect(d.database?.ok, `database NOT reachable (${d.database?.error}) — check DATABASE_URL in the VPS .env`);
    expect(d.centralAuth?.ok, `Central Auth NOT reachable (${d.centralAuth?.error ?? "HTTP " + d.centralAuth?.status})`);
    if (d.jwtSecretConfigured === false) return { warn: "JWT_SECRET is missing/short/placeholder — set a real one" };
    return true;
  });

  await check("Unknown API route returns 404 (not 500)", async () => {
    const r = await http(`${V1}/this-route-does-not-exist`);
    expect(r.status === 404, `HTTP ${r.status}`);
  });

  await check("GET /auth/me without a token is rejected (401)", async () => {
    const r = await http(`${V1}/auth/me`);
    expect(r.status === 401, `HTTP ${r.status}`);
  });

  await check("GET /auth/me with a fake token is rejected (401)", async () => {
    const r = await http(`${V1}/auth/me`, { headers: { authorization: "Bearer not.a.real.token" } });
    expect(r.status === 401, `HTTP ${r.status}`);
  });

  await check("Signup rejects a bad phone number (400)", async () => {
    const r = await http(`${V1}/auth/register`, { method: "POST", body: { email: "x@example.com", password: "Secret123", phone: "12345" } });
    expect(r.status === 400, `HTTP ${r.status}`);
  });

  await check("Signup cannot self-assign the ADMIN role (400)", async () => {
    const r = await http(`${V1}/auth/register`, {
      method: "POST",
      body: { email: "x@example.com", password: "Secret123", phone: "9876543210", role: "ADMIN" },
    });
    expect(r.status === 400, `HTTP ${r.status} (must be 400 — otherwise anyone could become admin)`);
  });

  await check("Signup rejects unknown extra fields (400)", async () => {
    const r = await http(`${V1}/auth/register`, {
      method: "POST",
      body: { email: "x@example.com", password: "Secret123", phone: "9876543210", isAdmin: true },
    });
    expect(r.status === 400, `HTTP ${r.status}`);
  });

  await check("Login rejects a too-short password (400)", async () => {
    const r = await http(`${V1}/auth/login`, { method: "POST", body: { identifier: "a@b.com", password: "123" } });
    expect(r.status === 400, `HTTP ${r.status}`);
  });

  await check("Login with wrong credentials is refused (4xx, not 5xx)", async () => {
    const r = await http(`${V1}/auth/login`, {
      method: "POST",
      body: { identifier: `nobody-${Date.now()}@example.com`, password: "WrongPass123" },
    });
    expect(r.status >= 400 && r.status < 500, `HTTP ${r.status} — a 5xx here usually means Central Auth is unreachable from the VPS`);
    return `HTTP ${r.status}`;
  });

  await check("Public profile of a non-existent user is 404/400 (not 500)", async () => {
    const r = await http(`${V1}/users/00000000-0000-4000-8000-000000000000`);
    expect([400, 404].includes(r.status), `HTTP ${r.status}`);
  });

  await check("Security headers present (helmet)", async () => {
    const r = await http(`${V1}/health`);
    expect(r.headers.get("x-content-type-options") === "nosniff", "x-content-type-options missing");
  });

  if (SAME_ORIGIN) {
    report("skip", "CORS checks", "not needed: the browser only talks to the site itself (same origin)");
  } else await check("CORS allows the real frontend origin", async () => {
    const origin = new URL(FRONTEND).origin;
    const r = await http(`${V1}/auth/login`, {
      method: "OPTIONS",
      headers: { origin, "access-control-request-method": "POST", "access-control-request-headers": "content-type" },
    });
    const allow = r.headers.get("access-control-allow-origin");
    expect(allow === origin, `allow-origin is "${allow}" — set CORS_ORIGINS=${origin} in the VPS .env`);
  });

  if (!SAME_ORIGIN) await check("CORS does NOT allow a random website", async () => {
    const evil = "https://evil.example.com";
    const r = await http(`${V1}/auth/login`, {
      method: "OPTIONS",
      headers: { origin: evil, "access-control-request-method": "POST" },
    });
    const allow = r.headers.get("access-control-allow-origin");
    expect(allow !== evil && allow !== "*", `allow-origin is "${allow}"`);
  });

  await check("Swagger docs exposure", async () => {
    const r = await http(`${API}/api/docs`);
    if (r.status === 200) return { warn: "/api/docs is public — fine for now, consider hiding it in production" };
    return `not public (HTTP ${r.status})`;
  });
}

// ───────────────────────── 2. FRONTEND ─────────────────────────
async function frontend() {
  section(`2. Frontend  (${FRONTEND})`);

  if (FRONTEND.startsWith("https://")) {
    await check("http:// redirects to https://", async () => {
      const r = await http(FRONTEND.replace("https://", "http://"), { redirect: "manual", timeout: 10000 });
      expect([301, 302, 307, 308].includes(r.status), `HTTP ${r.status}`);
      expect((r.headers.get("location") || "").startsWith("https://"), `location: ${r.headers.get("location")}`);
    });
  }

  let loginHtml = "";
  const slow = [];
  let pagesOk = 0;
  const bad = [];
  for (const path of PAGES) {
    try {
      const r = await http(FRONTEND + path);
      if (path === "/login") loginHtml = r.text;
      const ok = r.status === 200 && /<html/i.test(r.text) && !/Application error: a client-side exception/i.test(r.text);
      if (ok) pagesOk++;
      else bad.push(`${path} (HTTP ${r.status})`);
      if (r.ms > 4000) slow.push(`${path} ${r.ms}ms`);
    } catch (e) {
      bad.push(`${path} (${e?.cause?.code || e.message})`);
    }
  }
  await check(`All ${PAGES.length} pages load (HTTP 200)`, () =>
    bad.length ? { fail: `${bad.length} failed: ${bad.slice(0, 6).join(", ")}` } : `${pagesOk}/${PAGES.length}`
  );
  await check("Pages respond fast (< 4 s)", () => (slow.length ? { warn: slow.slice(0, 4).join(", ") } : true));

  await check("Unknown page returns a real 404", async () => {
    const r = await http(`${FRONTEND}/definitely-not-a-page-xyz`);
    expect(r.status === 404, `HTTP ${r.status}`);
  });

  await check("Frontend does not point at localhost", async () => {
    expect(loginHtml, "could not load /login to inspect it");
    const scripts = [...new Set([...loginHtml.matchAll(/\/_next\/static\/[^"'\s]+\.js/g)].map((m) => m[0]))].slice(0, 60);
    expect(scripts.length > 0, "no JS bundles found on /login");
    const apiOrigin = new URL(API).origin;
    let hasApi = false;
    let hasLocalhost = false;
    let separateApi = "";
    for (let i = 0; i < scripts.length; i += 10) {
      const batch = await Promise.all(scripts.slice(i, i + 10).map((s) => http(FRONTEND + s).catch(() => null)));
      for (const r of batch) {
        if (!r) continue;
        if (r.text.includes(apiOrigin)) hasApi = true;
        if (/localhost:4000/.test(r.text)) hasLocalhost = true;
        const sep = r.text.match(/https?:\/\/jobportal-api\.[a-z0-9.-]+/i);
        if (sep) separateApi = sep[0];
      }
    }
    const frontendIsLocal = /localhost|127\.0\.0\.1/.test(FRONTEND);
    if (!frontendIsLocal && hasLocalhost)
      throw new Error("the JS bundle still contains http://localhost:4000 — the frontend was built with the old API setting; rebuild/redeploy the latest code");
    if (SAME_ORIGIN && separateApi)
      throw new Error(`the frontend still calls the separate API domain ${separateApi} (baked in at build time). Deploy ALL v4 files (Dockerfile, docker-compose.prod.yml, next.config.ts, lib/api-client.ts) and rebuild the frontend image`);
    if (!SAME_ORIGIN) expect(hasApi, `API URL ${apiOrigin} not found in the JS bundle`);
    return true;
  });
}

// ───────────────────────── 3. LOGGED-IN API FLOW ─────────────────────────
async function authFlow() {
  section("3. Logged-in API flow");
  let identifier = EMAIL;
  let password = PASSWORD;
  let createdAccount = false;

  if (!identifier && SIGNUP) {
    const stamp = Date.now();
    identifier = `jobconnect.smoke+${stamp}@example.com`;
    password = `Smoke@${String(stamp).slice(-6)}`;
    const phone = "9" + String(Math.floor(Math.random() * 1e9)).padStart(9, "0");
    let token;
    await check("Signup creates a new SEEKER account", async () => {
      const r = await http(`${V1}/auth/register`, { method: "POST", body: { email: identifier, password, phone, role: "SEEKER" } });
      expect(r.status === 201 || r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 160)}`);
      expect(r.json?.accessToken, "no accessToken in response");
      expect(r.json?.user?.role === "SEEKER", `role is ${r.json?.user?.role}`);
      token = r.json.accessToken;
      createdAccount = true;
      return `${identifier} / ${password}`;
    });
    if (!token) return;
  }
  if (!identifier || !password) {
    report("skip", "Logged-in checks", "set TEST_EMAIL + TEST_PASSWORD (existing account) or TEST_SIGNUP=1 to run them");
    return;
  }

  let session;
  await check("Login returns a token and user", async () => {
    const r = await http(`${V1}/auth/login`, { method: "POST", body: { identifier, password } });
    expect(r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 160)}`);
    expect(r.json?.accessToken && r.json?.user, "response missing accessToken/user");
    session = r.json;
    return `role ${session.user.role}`;
  });
  if (!session) return;
  const auth = { authorization: `Bearer ${session.accessToken}` };

  await check("GET /auth/me works and leaks no secrets", async () => {
    const r = await http(`${V1}/auth/me`, { headers: auth });
    expect(r.status === 200, `HTTP ${r.status}`);
    const u = r.json?.user;
    expect(u?.email, "no user.email");
    expect(!("centralAccessToken" in u) && !("password" in u) && !("passwordHash" in u), "response contains secret fields!");
  });

  await check("A tampered token is rejected (401)", async () => {
    const bad = session.accessToken.slice(0, -3) + (session.accessToken.endsWith("abc") ? "xyz" : "abc");
    const r = await http(`${V1}/auth/me`, { headers: { authorization: `Bearer ${bad}` } });
    expect(r.status === 401, `HTTP ${r.status}`);
  });

  await check("Cannot switch own role to ADMIN (400)", async () => {
    const r = await http(`${V1}/users/role`, { method: "PATCH", headers: auth, body: { role: "ADMIN" } });
    expect(r.status === 400, `HTTP ${r.status} — privilege escalation possible!`);
  });

  await check("Profile update rejects unknown fields (400)", async () => {
    const r = await http(`${V1}/users/profile`, { method: "PATCH", headers: auth, body: { role: "ADMIN", hacked: true } });
    expect(r.status === 400, `HTTP ${r.status}`);
  });

  if (createdAccount) {
    await check("Profile update saves (throwaway account only)", async () => {
      const r = await http(`${V1}/users/profile`, { method: "PATCH", headers: auth, body: { headline: "Smoke test", city: "Ahmedabad" } });
      expect(r.status === 200, `HTTP ${r.status}: ${r.text.slice(0, 160)}`);
      const me = await http(`${V1}/auth/me`, { headers: auth });
      expect(me.json?.user?.city === "Ahmedabad", "city did not persist");
    });
  } else {
    report("skip", "Profile update saves", "skipped for existing accounts so your real data is never modified");
  }

  await check("Public profile hides email / phone", async () => {
    const r = await http(`${V1}/users/${session.user.id}`);
    expect(r.status === 200, `HTTP ${r.status}`);
    expect(r.json && !("email" in r.json) && !("phone" in r.json), "public profile exposes email/phone");
  });

  await check("Logout revokes the session", async () => {
    const out = await http(`${V1}/auth/logout`, { method: "POST", headers: auth });
    expect(out.status === 200, `logout HTTP ${out.status}`);
    const after = await http(`${V1}/auth/me`, { headers: auth });
    expect(after.status === 401, `token still works after logout (HTTP ${after.status})`);
  });

  if (createdAccount) console.log(c(33, `\n  Note: a throwaway account was created: ${identifier} / ${password}  (delete it from Central Auth if you don't need it)`));
}

// ───────────────────────── run ─────────────────────────
console.log(c(1, "JobConnect smoke test"));
console.log(c(90, `frontend: ${FRONTEND}\napi:      ${API}`));
const t0 = Date.now();
await backendPublic();
await frontend();
await authFlow();

console.log(`\n${c(1, "Result")}: ${c(32, stats.pass + " passed")}, ${stats.fail ? c(31, stats.fail + " failed") : "0 failed"}, ${stats.warn} warnings, ${stats.skip} skipped  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
if (failures.length) {
  console.log(c(31, "\nFailed checks:"));
  failures.forEach((f) => console.log("  - " + f));
}
process.exit(stats.fail ? 1 : 0);
