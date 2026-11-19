# Pavitram Realestate

A verification-first Indian real-estate marketplace — property search + owner/agent/builder
listing tools + an in-platform services marketplace, unified into one Next.js app.

Built as a frontend prototype: professional UI throughout, realistic mock data, and several
genuinely interactive tools (EMI calculator, loan eligibility, quote builder, lead pipeline,
availability grid, and full post-property / post-project forms). No backend — all data lives
in `lib/mock-data.ts`.

## Design

Dark navy (`#0B0F1F`) + antique gold (`#C9A227` / `#D4AF37`) + warm cream (`#FAF7F2`), with
charcoal-navy headings and muted grey body text. All tokens live in `app/globals.css` under
`@theme` — change a value there and it updates everywhere.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Recharts** for charts, **lucide-react** for icons
- Fonts self-hosted via `@fontsource` (Newsreader, Inter, IBM Plex Mono) — no external font
  requests at runtime

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To build for production:

```bash
npm run build
npm run start
```

## What's in here

**Public / marketing**
- `/` — landing page (search, popular cities, trust section, services teaser)
- `/properties`, `/properties/[id]` — search results + property detail
- `/projects`, `/projects/[id]` — new-launch project browsing + detail (unit pricing, RERA, amenities)
- `/city/[city]` — city guides with locality price trends (Ahmedabad, Mumbai, Bengaluru, Pune, Delhi)
- `/localities/[slug]` — individual locality guides (schools, hospitals, price trend, resident reviews)
- `/builders/[slug]` — builder profile pages with their live listings
- `/home-loans` — lender comparison, EMI calculator, eligibility checker
- `/services` — services marketplace (material suppliers, legal, home services, finance)
- `/resources`, `/resources/[slug]` — buying guides and explainer articles
- `/nri` — NRI corner (remote buying, video tours, loan help)
- `/login` — role picker into each dashboard

**Dashboards** (all under `/dashboard/...`)
- `admin/` — Super Admin: overview, users & KYC, listing moderation, revenue, CMS &
  marketing, disputes, analytics, security & audit, services governance
- `owner/` — Owner / Agent / Builder: overview, listings (+ **post a property** form),
  leads (CRM), builder projects (+ **add a project** form with dynamic unit pricing),
  verification & RERA, messages, analytics, subscription & credits
- `seeker/` — Property Seeker: overview, saved searches, wishlist & compare, site visits,
  financial & legal tools, messages
- `provider/` — Service Provider: overview, bookings, calendar & availability, quotes,
  earnings & payouts

## Notes

- Property photos are hotlinked from Unsplash for the demo — swap `lib/mock-data.ts`'s
  `image` fields for real listing photos whenever you're ready.
- All data is mock data in `lib/mock-data.ts`. Wiring this up to a real backend means
  replacing those exports with API calls (the component props/shapes are already set up
  to make that a fairly mechanical swap).
- Design tokens (colors, fonts) live in `app/globals.css` under `@theme`.
