# Pavitram — Frontend (Next.js)

Frontend UI for the Pavitram Hybrid B2B & B2C Commerce Platform, built
from the product specification document.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## What's included

- **B2C Retail storefront** — homepage, product listing/filters, product
  detail with tiered B2B pricing, multi-vendor cart, checkout, login/register
- **B2B Business Buyer Portal** (`/b2b`) — company KYC registration,
  buyer dashboard (credit limit, orders), RFQ submission & tracking
- **Vendor Portal** (`/vendor/dashboard`) — catalog & inventory, order
  pipeline (B2C + B2B stages), RFQ inbox, earnings & receivables
- **Super Admin Control Tower** (`/admin/dashboard`) — vendor lifecycle,
  B2B account approvals, disputes & logistics, GST/analytics

All data is mocked in `lib/data.js` — there is no backend yet. Every
button and form is wired for UI/UX only; connect real APIs by replacing
the mock data functions and adding real form submit handlers.

## Folder structure

```
frontend/
├── app/                  → all pages & routes (Next.js App Router)
│   ├── layout.js         → root layout (fonts, metadata)
│   ├── globals.css       → design tokens (colors, type)
│   ├── page.js           → B2C homepage ("/")
│   ├── products/         → "/products" and "/products/[id]"
│   ├── cart/             → "/cart"
│   ├── checkout/         → "/checkout"
│   ├── login/, register/ → auth pages
│   ├── b2b/               → Business Buyer Portal
│   ├── vendor/            → Vendor Portal
│   └── admin/             → Super Admin Control Tower
├── components/            → shared UI (Navbar, Footer, ProductCard, etc.)
├── lib/                   → mock data + nav configs
└── public/                → static assets
```
