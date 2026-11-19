# JobConnect — Frontend (Next.js)

A complete frontend for **Pavitram JobConnect** — a job portal that combines
Naukri.com-style job search/hiring tools with LinkedIn-style professional
networking. **38 pages**, frontend-only (all data mocked in `lib/data.ts`).

## Full page list

**Marketing** — `/`, `/login`, `/signup`

**Job Seeker** (`/seeker/...`) — 18 pages
| Page | What it does |
|---|---|
| `dashboard` | Overview, matched jobs, upcoming interviews |
| `jobs` | Search, filters, saved jobs, Easy Apply |
| `jobs/[id]` | Full job detail — description, requirements, benefits, similar jobs |
| `applications` | Application status tracker |
| `job-alerts` | Saved search alerts |
| `resume-builder` | Multi-step resume builder with live preview |
| `assessments` | Take skill tests, get a score and a verified badge |
| `interview-prep` | Common interview questions with answer tips |
| `learning` | Courses, enroll, track progress |
| `messages` | Inbox + live chat with recruiters |
| `notifications` | Notification center |
| `network` | Feed, connections, suggested people |
| `people` | Search and connect with people |
| `groups` | Browse and join professional groups |
| `companies` / `companies/[id]` | Browse companies, follow, reviews, open roles |
| `salary-insights` | Salary by experience and city |
| `premium` | Subscription plans |
| `profile` | Full profile — experience timeline, education, skills, recommendations, resume, video intro |
| `profile-views` | Who viewed your profile, trend chart |
| `settings` | Account, notifications, privacy, password |
| `search` | Global search across jobs, people, companies |

**Employer** (`/employer/...`) — 8 pages
| Page | What it does |
|---|---|
| `dashboard` | Hiring overview, funnel, top candidates |
| `jobs` | Job postings + "Post a job" builder |
| `candidates` | Drag-and-drop ATS Kanban, resume search, schedule interview |
| `talent-pool` | Saved candidates for future roles |
| `messages` | Inbox to chat with candidates |
| `analytics` | Funnel, time-to-hire, source-of-hire |
| `company` | Company profile / career-page branding, team management |
| `billing` | Plans, buy credits, invoices |

**Super Admin** (`/admin/...`) — 5 pages
| Page | What it does |
|---|---|
| `dashboard` | Platform metrics, growth trend, moderation + support snapshot |
| `users` | Account management, bulk actions |
| `moderation` | Fraud/fake-job review queue |
| `revenue` | MRR/ARR, plan split |
| `settings` | Platform settings, admin team & roles, fraud rules |

## Design system

CSS variables in `app/globals.css` drive the whole theme:
- Deep navy `#0B0F1F` — hero, sidebar, footer, dark panels
- Antique gold `#C9A227` — buttons, logo, headings accent, icons
- Off-white / cream `#FAF7F2` — light section background
- Charcoal navy `#1A2238` — text on light sections
- White — text on dark sections
- Muted grey `#6B6F7B` — body text

Signature element: the circular **match-ring** (`components/ui/MatchRing.tsx`)
used everywhere a match score appears.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # production build
```

## Project structure

```
app/
  page.tsx                     landing page
  login/, signup/               auth
  seeker/layout.tsx             seeker shell + 18 pages
  employer/layout.tsx           employer shell + 8 pages
  admin/layout.tsx              admin shell + 5 pages
components/
  ui/                           Badge, StatCard, MatchRing, Charts, PageHeader
  dashboard/DashboardShell.tsx  shared sidebar/topbar shell (role-aware, wired search + notifications)
  marketing/                    Nav, Footer
lib/data.ts                     all mock data for every page
```
