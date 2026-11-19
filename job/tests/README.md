# Site testing

## 1. Smoke test (no install, ~10 seconds)
Needs only Node 18+. Checks the backend API, all 39 frontend pages, CORS, security rules,
and that the frontend is really pointed at the production API.

    node tests/smoke-test.mjs

Also test the logged-in flow (login, /me, role-escalation blocked, logout revokes token):

    # Linux/Mac
    TEST_EMAIL=you@example.com TEST_PASSWORD=yourpass node tests/smoke-test.mjs
    # Windows PowerShell
    $env:TEST_EMAIL="you@example.com"; $env:TEST_PASSWORD="yourpass"; node tests/smoke-test.mjs

`TEST_SIGNUP=1` instead creates a throwaway account (real account in the shared Central Auth!).
Exit code is 1 if anything fails, so it can be used in CI.

## 2. Browser test (real Chrome: login -> every page -> resume builder -> PDF -> logout, desktop + phone)

    npm i -D playwright
    npx playwright install chromium
    TEST_EMAIL=you@example.com TEST_PASSWORD=yourpass node tests/e2e-browser.mjs

Use a **job seeker** account. Failures save a screenshot in `e2e-screenshots/`.
Add `HEADED=1` to watch the browser.

Both scripts default to https://jobportal.pavitramindia.com. The API is reached through the same site (`/api/v1/...`),
so API_URL defaults to FRONTEND_URL; set API_URL only to test a backend on a separate domain.
