# Pavitram Backend (NestJS + Prisma + PostgreSQL + MinIO/S3)

> ## 🚨 READ THIS FIRST — DATABASE_URL POINTS AT A SHARED SERVER
>
> The Postgres server in your `.env` (`200.97.171.20:32769`, database
> `pavitram_db`) is **not exclusive to this project** — you have at least
> one other project (a real-estate backend, judging by the folder path in
> the original `_env.txt`: `/var/www/realestate/backend`) whose data can
> live on the **same physical database**.
>
> Prisma's `migrate dev` and `migrate reset` commands are destructive **at
> the schema level**: the first time they run against a target that already
> has tables Prisma doesn't recognize (because they belong to a different
> project's migration history), Prisma treats that as "drift" and offers —
> or in non-interactive contexts, performs — a full **reset of that schema**,
> dropping every table in it. Table name prefixes (`ecom_*`) do **not**
> protect against this, because a reset drops the whole schema, not just
> the tables Prisma is tracking.
>
> **Before you run any `prisma migrate` or `prisma db` command again:**
> 1. Confirm which schema each project actually uses. This project's
>    `.env` now has `?schema=ecom` on `DATABASE_URL` — if your other
>    project's tables are sitting in the default `public` schema, they are
>    technically isolated from this one *as long as nothing runs a reset
>    against `public`*.
> 2. **Strongly prefer a fully separate PostgreSQL *database* over a shared
>    database with separate schemas.** Schemas reduce naming collisions but
>    do not fully isolate you from another project's migration tooling.
>    On the same server: `CREATE DATABASE pavitram_db;` for this project,
>    keep the other project on its own database entirely.
> 3. Use `npx prisma migrate deploy` (applies existing migrations, never
>    prompts for or performs a reset) instead of `migrate dev` on any server
>    that isn't purely local/disposable. Reserve `migrate dev` for a local
>    machine or a database you're fine wiping.
> 4. Take a `pg_dump` backup of the whole server before running anything
>    here, and check with whoever administers `200.97.171.20` whether
>    automatic backups/snapshots already exist — if the other project's
>    data was wiped by a reset, a recent snapshot may be the fastest way to
>    get it back. I don't have access to that server and can't recover data
>    myself.

✅ **Yeh COMPLETE backend hai — Part 1 + Part 2 dono combine karke.** Frontend
(`frontend/lib/data.js` + `frontend/lib/store.js`) me jitne bhi data
collections/resources use ho rahe the, un sabke liye full CRUD APIs yahan
hain. **Login/signup APIs jaan-boojh kar nahi hain** (jaisa instruction tha)
— `/api/users` sirf plain user-record CRUD hai.

> Note: Part 1 me ek import-path bug tha (`prisma.service` galat relative
> path se import ho raha tha, jisse project compile hi nahi hota) — wo is
> final version me fix kar diya gaya hai. Ab poora project as-is chalega.

## Modules (29 resources, sab full CRUD)

**Part 1 se:** categories, banners, coupons, support-tickets,
notification-rules, integrations, security-settings, activity-logs,
gst-summary, hero-stats, gmv-trends, cohorts, vendor-scorecards, languages,
saved-addresses, credit-notes, b2b-invoices, sample-orders, receivables,
contract-pricing, team-members, rfqs, users (no auth), storage/uploads.

**Part 2 se (naye is delivery me):**
- **products** — full CRUD + tier-pricing (bulk quantity slabs), filter by
  category/vendorId/channel/search
- **vendors** — full CRUD + nested **store-profile** + **warehouses**
- **vendor-reviews** — full CRUD, filter by vendorId
- **business-buyers** — full CRUD, includes linked team members
- **orders** — full CRUD, auto-generates `PVT-xxxxx` id, clears cart on place
- **cart** — add (merges qty for same product+variant), update qty, remove,
  clear
- **wishlist** — add, toggle, list, remove, clear

Every table is created in Postgres with an `ecom_` prefix (`ecom_products`,
`ecom_vendors`, `ecom_orders`, etc. — see `prisma/schema.prisma`).

## 1. Install

```bash
cd pavitram-backend
npm install
```

## 2. Configure `.env`

`.env` is already filled in from your `_env.txt`. **Zaroor double-check**
these two lines — the original file had corrupted characters (colons/slashes
missing, looked like a text-extraction glitch), so they're reconstructed
best-guess:

```
DATABASE_URL="postgresql://pavitramindiaoffice%40gmail.com:P%40v1tram%402o26@200.97.171.20:32769/pavitram_db"
AWS_ENDPOINT_URL=http://200.97.171.20:9000
```

Agar connection fail ho to sirf inhi lines ko apne asli values se replace
karo — baaki sab (bucket, keys, JWT secret) already sahi copy ho gaya hai.

## 3. Generate Prisma Client + migrate the database

This step needs internet access to `binaries.prisma.sh` (Prisma downloads a
small query-engine binary) — run it from your own machine/server, not from
a network-restricted sandbox.

**If this is the very first migration ever run against this database/schema
and you haven't already, back it up first (see the warning at the top of
this file), then run:**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

**Every time after that — and especially on the shared server — use the
non-destructive command instead:**

```bash
npx prisma migrate deploy
```

`migrate deploy` only applies migrations that don't exist yet; unlike
`migrate dev`, it never detects "drift" and never offers/performs a reset.

This creates every table in Postgres, each with the `ecom_` prefix.

If your Postgres server isn't reachable from where you're running this
locally (e.g. it's on `200.97.171.20`, a private/remote server), either:
- run these commands **on that server** (or a machine that can reach it), or
- SSH-tunnel/port-forward `32769` to your local machine first.

## 4. Run

```bash
npm run start:dev
```

- API base: `http://localhost:4000/api`
- Swagger docs (test every endpoint here): `http://localhost:4000/api/docs`

## Standard pattern (same for every simple resource)

```
GET    /api/<resource>          -> list (supports ?search=&page=&limit=, plus resource-specific filters)
GET    /api/<resource>/:id      -> get one
POST   /api/<resource>          -> create
PATCH  /api/<resource>/:id      -> update
DELETE /api/<resource>/:id      -> delete
```

## Part 2 resources — endpoint details

### Products (+ tier pricing)
```
GET    /api/products?search=&category=&vendorId=&channel=&page=&limit=
GET    /api/products/:id
POST   /api/products              (can include tierPricing: [{min,max,price}] in the body)
PATCH  /api/products/:id          (sending tierPricing[] replaces the whole slab list)
DELETE /api/products/:id

GET    /api/products/:productId/tier-pricing
POST   /api/products/:productId/tier-pricing          (add one slab)
PATCH  /api/products/:productId/tier-pricing/:tierId
DELETE /api/products/:productId/tier-pricing/:tierId
```

### Vendors (+ store profile + warehouses)
```
GET    /api/vendors?search=&channel=&status=&page=&limit=
GET    /api/vendors/:id           (includes storeProfile + warehouses)
POST   /api/vendors
PATCH  /api/vendors/:id
DELETE /api/vendors/:id

GET    /api/vendors/:vendorId/store-profile
POST   /api/vendors/:vendorId/store-profile   (create/replace; can include warehouses[])
PUT    /api/vendors/:vendorId/store-profile   (same as POST)
DELETE /api/vendors/:vendorId/store-profile

GET    /api/vendors/:vendorId/warehouses
POST   /api/vendors/:vendorId/warehouses      (add one warehouse)
PATCH  /api/vendors/:vendorId/warehouses/:warehouseId
DELETE /api/vendors/:vendorId/warehouses/:warehouseId
```

### Vendor reviews
```
GET    /api/vendor-reviews?vendorId=&search=&page=&limit=
GET    /api/vendor-reviews/:id
POST   /api/vendor-reviews
PATCH  /api/vendor-reviews/:id
DELETE /api/vendor-reviews/:id
```

### Business buyers
```
GET    /api/business-buyers?search=&segment=&status=&page=&limit=
GET    /api/business-buyers/:id   (includes teamMembers)
POST   /api/business-buyers
PATCH  /api/business-buyers/:id
DELETE /api/business-buyers/:id
```

### Orders
```
GET    /api/orders?search=&type=&status=&page=&limit=
GET    /api/orders/:id            (includes creditNotes)
POST   /api/orders                (id auto-generated as "PVT-xxxxx" if omitted;
                                    pass userId to auto-clear that user's cart)
PATCH  /api/orders/:id
DELETE /api/orders/:id
```

### Cart
```
GET    /api/cart?userId=
GET    /api/cart/:id
POST   /api/cart                  ({ userId?, productId, variantId?, qty }) — same
                                   product+variant for a user bumps qty instead of duplicating
PATCH  /api/cart/:id              ({ qty }) — qty=0 removes the item
DELETE /api/cart/clear?userId=
DELETE /api/cart/:id
```

### Wishlist
```
GET    /api/wishlist?userId=
GET    /api/wishlist/:id
POST   /api/wishlist              ({ userId?, productId }) — idempotent
POST   /api/wishlist/toggle       ({ userId?, productId }) — add if absent, remove if present
DELETE /api/wishlist/clear?userId=
DELETE /api/wishlist/:id
```

## Part 3 (this delivery) — Loyalty, Commissions, Disputes, Returns

Added to close the remaining gaps against the spec doc. No subscription
module was added (explicitly out of scope), and payments remain **Cash on
Delivery only** — no other gateway was wired in.

### Loyalty, Rewards & Referral (Doc §3.1)
```
GET    /api/loyalty/:userId          -> account (auto-created on first hit) + recent transactions + referrals
POST   /api/loyalty/earn             { userId, points, orderId?, note? }
POST   /api/loyalty/redeem           { userId, points, orderId?, note? }  (errors if balance too low)

POST   /api/referrals                { referrerUserId, referredEmail, referredUserId? }
GET    /api/referrals?userId=
PATCH  /api/referrals/:id            { status: "Completed"|"Rewarded", bonusPoints? }
                                      -> setting status "Rewarded" auto-credits the bonus
                                         (default 250) to the referrer's loyalty account
```
Tier (Silver / Gold / Platinum) is derived automatically from lifetime
points earned (5,000 -> Gold, 20,000 -> Platinum).

### Commission & Dynamic Payout Engine (Doc §1.2)
```
GET    /api/commission-rules?scope=&channel=&page=&limit=
GET    /api/commission-rules/resolve?channel=&orderValue=&vendorId=&category=&productId=
                                      -> picks the most specific active rule (product > vendor > category > global)
                                         and returns { rule, commission }
POST   /api/commission-rules         { scope: global|category|vendor|product, scopeRef?, channel?, type?, value, minOrderValue?, maxOrderValue?, active? }
PATCH  /api/commission-rules/:id
DELETE /api/commission-rules/:id

GET    /api/payouts?vendorId=&status=&page=&limit=
POST   /api/payouts                  { vendorId, channel?, periodFrom, periodTo, grossSales, commission, netPayout, notes? }
PATCH  /api/payouts/:id              (status -> "Paid" auto-stamps paidAt)
DELETE /api/payouts/:id
```

### Dispute Management (Doc §1.5)
```
GET    /api/disputes?orderId=&stage=&search=&page=&limit=
POST   /api/disputes                 { orderId, raisedBy: customer|business_buyer|vendor, against?, type, description?, evidenceUrls? }
PATCH  /api/disputes/:id             { stage, resolution? }  (stage: Evidence Review -> Vendor Response Pending -> Admin Arbitration -> Refund Approved/Closed/Rejected)
DELETE /api/disputes/:id
```

### Return / Refund Requests (Doc §3.1)
```
GET    /api/returns?orderId=&userId=&status=&page=&limit=
POST   /api/returns                  { orderId, userId?, reason, photos? }
PATCH  /api/returns/:id              { status: Requested|Approved|Rejected|PickupScheduled|Refunded, refundAmount?, refundMethod?, adminNote? }
DELETE /api/returns/:id
```

### Wishlist price-drop alerts (Doc §3.1, extends the existing wishlist module)
```
GET    /api/wishlist/price-drops?userId=   -> items whose product price has fallen to/below the saved alertPrice
PATCH  /api/wishlist/:id/price-alert       { alertPrice?, alertActive? }
PATCH  /api/wishlist/:id/acknowledge-drop  -> call after notifying the customer, so it stops resurfacing
```
`POST /api/wishlist` now also accepts an optional `alertPrice` at save time.

## File uploads (product images, KYC docs, banners — same endpoint for all)

```
POST   /api/uploads?folder=products      (multipart field name: "file")
POST   /api/uploads/multiple?folder=kyc  (multipart field name: "files")
GET    /api/uploads?folder=products
DELETE /api/uploads/:id
```

## Login/Signup

Instruction ke mutabik is backend me **login aur signup ki koi API nahi
hai**. `/api/users` sirf plain user-record CRUD hai (admin ke liye) — auth
flow chahiye ho to alag se batana, add kar denge.

## Connecting the frontend

Is backend ko abhi frontend me wire **nahi** kiya gaya hai (jaisa asked
tha) — `frontend/lib/data.js` ke seed arrays aur `frontend/lib/store.js` ke
CRUD calls ko in hi shape/field-names wale REST endpoints se replace karna
hoga jab connect karna ho. Har resource ka response shape frontend ke
mock-data shape se match karta hai, isliye swap seedha hoga.
