#!/usr/bin/env node
/**
 * JobConnect — real-browser test (login -> every dashboard page -> resume builder -> PDF download).
 * Run it AFTER tests/smoke-test.mjs passes.
 *
 * One-time setup (in the repo root):
 *   npm i -D playwright
 *   npx playwright install chromium
 *
 * Run:
 *   TEST_EMAIL=you@example.com TEST_PASSWORD=yourpass node tests/e2e-browser.mjs
 *   (Windows PowerShell:  $env:TEST_EMAIL="you@example.com"; $env:TEST_PASSWORD="yourpass"; node tests/e2e-browser.mjs)
 *
 * Optional: FRONTEND_URL (default https://jobportal.pavitramindia.com), HEADED=1 to watch the browser.
 * Use a JOB SEEKER account to test the resume builder. Nothing in your account is modified.
 */
import fs from "node:fs";
import path from "node:path";

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright is not installed. Run:\n  npm i -D playwright\n  npx playwright install chromium");
  process.exit(2);
}

const FRONTEND = (process.env.FRONTEND_URL || "https://jobportal.pavitramindia.com").replace(/\/+$/, "");
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;
if (!EMAIL || !PASSWORD) {
  console.error("Set TEST_EMAIL and TEST_PASSWORD first (see the comment at the top of this file).");
  process.exit(2);
}

const SECTIONS = {
  seeker: ["dashboard", "jobs", "jobs/1", "search", "applications", "job-alerts", "resume-builder", "assessments", "interview-prep", "learning", "messages", "notifications", "network", "people", "groups", "companies", "companies/1", "salary-insights", "profile", "profile-views", "premium", "settings"],
  employer: ["dashboard", "jobs", "candidates", "talent-pool", "messages", "analytics", "billing", "company"],
  admin: ["dashboard", "users", "moderation", "revenue", "settings"],
};

const tty = process.stdout.isTTY;
const c = (code, s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
let fails = 0;
const shotDir = path.resolve("e2e-screenshots");
fs.mkdirSync(shotDir, { recursive: true });
const ok = (n, d = "") => console.log(`  ${c(32, "PASS")}  ${n}${d ? c(90, "  — " + d) : ""}`);
const bad = (n, d = "") => { fails++; console.log(`  ${c(31, "FAIL")}  ${n}${d ? c(90, "  — " + d) : ""}`); };
const note = (n, d = "") => console.log(`  ${c(33, "NOTE")}  ${n}${d ? c(90, "  — " + d) : ""}`);

async function step(page, name, fn) {
  try {
    const r = await fn();
    ok(name, typeof r === "string" ? r : "");
    return true;
  } catch (e) {
    const file = path.join(shotDir, name.replace(/[^\w]+/g, "_").slice(0, 60) + ".png");
    await page.screenshot({ path: file, fullPage: true }).catch(() => {});
    bad(name, (e.message || String(e)).split("\n")[0] + `  (screenshot: ${file})`);
    return false;
  }
}

async function run(label, viewport, mobile) {
  console.log(`\n${c(1, label)}`);
  const browser = await chromium.launch({ headless: process.env.HEADED !== "1" });
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, acceptDownloads: true });
  const page = await ctx.newPage();

  let jsErrors = [];
  const apiFails = [];
  page.on("pageerror", (e) => jsErrors.push(String(e.message).slice(0, 160)));
  page.on("response", (r) => {
    const u = r.url();
    if (r.status() >= 500 && !u.startsWith(FRONTEND + "/_next")) apiFails.push(`${r.status()} ${u.slice(0, 100)}`);
  });

  // ── login through the real form
  let role = "";
  const loggedIn = await step(page, `${label}: login`, async () => {
    await page.goto(`${FRONTEND}/login`, { waitUntil: "load" });
    await page.locator("input").first().fill(EMAIL);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/(seeker|employer|admin|onboarding)(\/|$)/, { timeout: 30000 });
    const m = page.url().match(/\/(seeker|employer|admin)\//);
    role = m ? m[1] : "seeker";
    if (page.url().includes("/onboarding")) throw new Error("account has not finished onboarding — log in once manually and pick a role");
    return `landed on ${new URL(page.url()).pathname}`;
  });
  if (!loggedIn) return browser.close();

  // ── visit every page of this role's section
  jsErrors = [];
  for (const p of SECTIONS[role] || []) {
    await step(page, `${label}: /${role}/${p} renders`, async () => {
      await page.goto(`${FRONTEND}/${role}/${p}`, { waitUntil: "load" });
      await page.waitForTimeout(500);
      const body = await page.locator("body").innerText();
      if (/Application error|client-side exception/i.test(body)) throw new Error("Next.js error screen");
      if (new URL(page.url()).pathname.startsWith("/login")) throw new Error("bounced to /login (session lost)");
      if (jsErrors.length) throw new Error("JS error: " + jsErrors.splice(0).join(" | "));
    });
  }

  // ── resume builder (job seekers only)
  if (role === "seeker") {
    await step(page, `${label}: resume builder end-to-end`, async () => {
      await page.goto(`${FRONTEND}/seeker/resume-builder`, { waitUntil: "load" });
      await page.getByText("Personal info").first().waitFor({ timeout: 15000 });
      const nameInput = page.locator("label:has-text('Full name') + input");
      const prefilled = await nameInput.inputValue();
      if (!prefilled.trim()) throw new Error("name is empty — it should be prefilled from your account");
      if (/Ananya Kulkarni/.test(await page.locator("body").innerText())) throw new Error("old demo data is showing");

      await page.getByRole("button", { name: /Summary/ }).click();
      const stamp = `Smoke test summary ${Date.now()} — experienced professional with a strong track record.`;
      await page.locator("textarea").fill(stamp);
      await page.getByRole("button", { name: /Skills/ }).click();
      await page.getByPlaceholder(/Type a skill/).fill("Teamwork, Communication");
      await page.keyboard.press("Enter");

      const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 20000 }), page.getByRole("button", { name: /Download PDF/ }).first().click()]);
      const file = path.join(shotDir, "resume-from-test.pdf");
      await dl.saveAs(file);
      const buf = fs.readFileSync(file);
      if (buf.subarray(0, 4).toString() !== "%PDF") throw new Error("downloaded file is not a PDF");
      if (buf.length < 1500) throw new Error(`PDF is suspiciously small (${buf.length} bytes)`);

      await page.reload({ waitUntil: "load" });
      await page.getByRole("button", { name: /Summary/ }).click();
      if ((await page.locator("textarea").inputValue()) !== stamp) throw new Error("draft was not remembered after refresh");
      // restore a clean slate so the test leaves nothing behind
      page.once("dialog", (d) => d.accept());
      await page.getByRole("button", { name: /Start over/ }).click();
      return `PDF ${(buf.length / 1024).toFixed(1)} KB saved to ${file}`;
    });
  } else {
    note("Resume builder skipped", `logged in as ${role}; use a job-seeker account to test it`);
  }

  // ── logout
  await step(page, `${label}: logout works`, async () => {
    await page.goto(`${FRONTEND}/${role}/dashboard`, { waitUntil: "load" });
    if (mobile) await page.locator("button:has(svg.lucide-menu):visible").first().click(); // phone: sidebar lives in the hamburger drawer
    await page.waitForTimeout(400);
    await page.locator("button[title='Log out']:visible").last().click({ timeout: 8000 });
    await page.waitForURL(/\/login/, { timeout: 15000 });
  });

  if (apiFails.length) bad(`${label}: server errors during the run`, apiFails.slice(0, 3).join(" | "));
  await browser.close();
}

console.log(c(1, "JobConnect browser test") + c(90, `  ${FRONTEND}`));
await run("Desktop", { width: 1440, height: 900 }, false);
await run("Mobile", { width: 390, height: 844 }, true);

console.log(`\n${fails ? c(31, `${fails} check(s) failed`) : c(32, "All browser checks passed")}`);
process.exit(fails ? 1 : 0);
