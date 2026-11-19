# Pavitram Real Estate — Backend (NestJS)

Real-estate module backend for the `pavitram-realestate` frontend. **Signup / Signin is
NOT implemented here** — it is delegated entirely to the central Pavitram Auth API
(`https://mainbackend.pavitramindia.com/api/v1`, see `AUTH_API_INTEGRATION.md`). This
service only verifies the `access_token` your frontend already obtained from there.

Every database table is prefixed with **`realnew_`** (e.g. `realnew_users`, `realnew_properties`,
`realnew_projects`, ...), as requested.

---

## How auth works here (important)

1. Frontend calls the **central** API directly for signup/signin:
   `POST https://mainbackend.pavitramindia.com/api/v1/auth/signup`
   `POST https://mainbackend.pavitramindia.com/api/v1/auth/signin`
2. Frontend gets back `access_token` and stores it (same as documented in
   `AUTH_API_INTEGRATION.md`).
3. Every call to **this** backend sends that same token:
   `Authorization: Bearer <access_token>`
4. This backend's `CentralAuthGuard` calls `GET /auth/me` on the central API to confirm
   the token is valid, then finds-or-creates a local `realnew_users` row keyed by the
   central `userId` (`RealUser.centralUserId`). No password ever touches this service.
5. A brand-new user starts with the local role `SEEKER`. They can add `OWNER` and/or
   `PROVIDER` roles to themselves any time via `PATCH /users/me/roles` (e.g. once they
   decide to list a property). `ADMIN` can never be self-granted — it is only ever
   mirrored in from the central account being `ADMIN`/`SUPER_ADMIN`.

This is "Tarika A" (direct shared login) from the integration guide, with the addition
that this service keeps its own lightweight profile per user for real-estate–specific
data (owner/agent/builder details, RERA number, provider category, KYC docs, etc.)
that the central auth schema doesn't have room for.

---

## Roles (local to this module)

| Role | Meaning |
|---|---|
| `SEEKER` | Default role for everyone — browsing, wishlist, site visits, messaging |
| `OWNER` | Owner / Agent / Builder — can post properties & projects, manage leads |
| `PROVIDER` | Service provider (material suppliers, legal, home services, finance) |
| `ADMIN` | Moderation, KYC review, user management — mirrored from central `ADMIN`/`SUPER_ADMIN` |

A single account can hold multiple roles at once.

---

## Setup

```bash
cp .env.example .env
# edit .env: set DATABASE_URL, CENTRAL_AUTH_BASE_URL (defaults to the production
# mainbackend URL already), CORS_ORIGINS

npm install
npx prisma migrate dev --name init   # creates all realnew_* tables
npm run prisma:seed                  # optional demo data
npm run start:dev
```

API docs (Swagger): `http://localhost:4000/api/docs`
All routes are additionally prefixed with `/api/v1` (e.g. `GET /api/v1/properties`).

---

## Module map

| Module | Routes | Notes |
|---|---|---|
| `users` | `/users/me`, `/users/me/roles`, `/users/me/kyc-documents`, `/users/:id` | Profile + role self-assignment + KYC doc submission |
| `properties` | `/properties` | Resale/rent/PG listings — public search, OWNER-only write |
| `projects` | `/projects` | Builder new-launch projects + unit pricing — OWNER-only write |
| `leads` | `/leads` | Owner-side CRM pipeline generated from enquiries |
| `site-visits` | `/site-visits` | Booking a physical visit to a property/project |
| `wishlist` | `/wishlist` | Seeker shortlist |
| `saved-searches` | `/saved-searches` | Seeker saved filters + alert toggle |
| `messages` | `/messages` | Simple 1:1 conversations, optionally scoped to a property |
| `providers` | `/providers` | Service-provider directory + self-service profile |
| `service-bookings` | `/service-bookings` | Booking a service provider |
| `reviews` | `/reviews` | Reviews on properties, projects, or providers |
| `subscriptions` | `/subscriptions` | Owner/provider plans & credits (static plan catalog — wire up real billing later) |
| `notifications` | `/notifications` | In-app notification inbox |
| `admin` | `/admin/*` | Moderation queue (properties/projects), KYC review, user management — `ADMIN` only |

Every protected route uses:
```
Authorization: Bearer <access_token from the central Pavitram Auth API>
```

---

## Deployment note (CORS)

Per `AUTH_API_INTEGRATION.md`, the **central auth service's** `.env` needs your
frontend's live domain in `CORS_ORIGINS` so browser calls to `/auth/signup` and
`/auth/signin` aren't blocked. Separately, **this** service's own `.env` also has a
`CORS_ORIGINS` — set it to the same frontend domain(s) so calls to properties/projects/etc.
work too. They are two different servers with two different CORS configs.

---

## Delivered in two parts

- **Part 1** — project scaffold, Prisma schema (all `realnew_*` tables), central-auth
  integration, roles system, `users`, `properties`, `projects` modules. Runs standalone.
- **Part 2** — adds `leads`, `site-visits`, `wishlist`, `saved-searches`, `messages`,
  `providers`, `service-bookings`, `reviews`, `subscriptions`, `notifications`, `admin`,
  plus the final `app.module.ts` that wires everything together and this README.

**To assemble:** unzip Part 1 into a folder, then unzip Part 2 **into the same folder**
(it only adds new module folders and overwrites `app.module.ts`/`README.md`). Then run
the Setup steps above once.
