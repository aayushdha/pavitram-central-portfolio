# Pavitram India — Frontend (Next.js) + Super Admin Panel

The full Pavitram India public website, now backed by a live CMS, plus a
built-in **Super Admin Panel** at `/super-admin` for editing site content
without touching code.

## 1. Install

```bash
npm install
```

## 2. Configure

```bash
cp .env.example .env.local
```

Set `NEXT_PUBLIC_API_BASE_URL` to your running backend, e.g.:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

(See the companion `pavitram-backend` project — start that first, run its
migrations + seed script, then come back here.)

## 3. Run

```bash
npm run dev
```

- Public site: `http://localhost:3000`
- Super Admin Panel: `http://localhost:3000/super-admin/login`
  — sign in with the Super Admin account created by the backend's seed script
  (see `pavitram-backend/.env` → `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`).

## What's dynamic now

Content across the site is fetched live from the backend, with the original
hand-written content kept as a fallback so pages never break if the backend
is briefly unreachable:

| Page(s) | Source | Editable from |
|---|---|---|
| All 13 `/services/*` pages | `main_services` | Super Admin → Services |
| All 4 `/opportunities/*` pages | `main_opportunities` | Super Admin → Opportunities |
| `/services`, `/opportunities` listings | same tables | same screens |
| Dashboard service grid | `main_services` (`showOnDashboard`) | Super Admin → Services |
| Homepage impact stats | `main_stats` | Super Admin → Impact Stats |
| Homepage testimonials | `main_testimonials` | Super Admin → Testimonials |
| `/faq` | `main_faqs` | Super Admin → FAQs |
| `/contact` info cards + address | `main_settings` | Super Admin → Site Settings |
| `/contact` form submissions | `main_contact_messages` | Super Admin → Contact Messages |
| `/join` form submissions | `main_community_members` | Super Admin → Join Requests |
| `/about` + 7 sub-pages (hero title/subtitle) | `main_pages` + `main_page_sections` | Super Admin → Pages & Sections |
| Login / Signup / Profile | `main_users` | Super Admin → Users & Roles |

The **Pages & Sections** screen is a generic content-block editor — you can
add new sections to any page (or new pages) with a structured JSON body, so
the content model isn't limited to what's pre-built.

## Super Admin Panel

Location: `src/app/super-admin/*`, shared UI in `src/components/admin/`.

- Guarded by role: only `ADMIN` / `SUPER_ADMIN` accounts can access it
  (enforced both client-side via redirect and server-side by the backend's
  `RolesGuard`).
- Reuses the exact same login/session system as the public site
  (`useAuth()` / `pavitram_token`) — an admin account is just a `main_users`
  row with an elevated role.
- Screens: Dashboard, Services, Opportunities, Pages & Sections, FAQs,
  Testimonials, Team, Impact Stats, Media Library, Site Settings, Join
  Requests, Contact Messages, Users & Roles.

### Promoting a user to Admin

The seed script creates one Super Admin. To give someone else access:
1. Sign in to `/super-admin` as Super Admin.
2. Go to **Users & Roles**.
3. Change their role to `ADMIN` (or add a brand-new admin account directly
   from that screen).

## Architecture notes

- `src/lib/api/config.ts` — shared fetch helpers (`publicGet`, `publicPost`,
  `authedRequest`). Public reads never throw — they resolve to `null` on any
  network/backend error so pages keep rendering their fallback content.
- `src/lib/api/cms.ts` — typed public read functions per content type.
- `src/lib/api/use-page-hero.ts` — small hook used by About pages to pull
  hero text from the generic Pages CMS.
- `src/lib/icon-map.ts` — maps icon *names* stored in the database (e.g.
  `"ShoppingBag"`) back to actual `lucide-react` components for rendering.
- `src/lib/admin/api.ts` — authenticated admin API client used only by
  `/super-admin/*` screens.
- `src/lib/auth/*` — **unchanged** from the original project; the backend
  was built to match this exact existing contract (`/api/v1/auth/*`,
  `/api/v1/users/profile-form`), so login, signup, and the Join Community
  form work with zero frontend changes beyond setting the API URL.

## Build

```bash
npm run build
npm start
```
