# JobPortal Backend — Auth (via Pavitram Central Auth) + Property Listings

A NestJS backend where **signup/login are third-party** — proxied to the
Pavitram Central Auth API (`mainbackend.pavitramindia.com`) exactly as
described in `AUTH_API_INTEGRATION.md` — and everything after that
(role selection, property listings, favorites, inquiries) is owned by this
service. Every database table is prefixed **`jobportal_`**, as requested.

Built and boot-tested against a real local PostgreSQL instance during
development — all endpoints below were exercised with `curl`, not just
compiled.

## How auth works here

1. **Register / Login never touch a local password.** `POST /auth/register`
   calls the central `/auth/signup` then `/auth/signin`; `POST /auth/login`
   calls central `/auth/signin` directly. Central Auth is the single source
   of truth for credentials.
2. After a successful central call, this backend **mirrors the user locally**
   (`jobportal_users`, keyed by the central `user.id`) with a role specific
   to THIS module — `BUYER`, `SELLER`, `AGENT`, or `ADMIN` (default `BUYER`).
3. This backend then issues **its own JWT** (a local session, stored in
   `jobportal_sessions` so it can be revoked on logout) — the client uses
   *this* token for every other endpoint, not the central one.
4. The central `access_token` is kept server-side only, so that profile
   edits (`PATCH /users/profile`) can be transparently forwarded to central
   auth's `PATCH /auth/profile` without the client ever handling that token.

## Stack

- **NestJS 10**, TypeScript
- **TypeORM 1.x** + PostgreSQL (chosen over Prisma — see note below)
- **Passport JWT** for local session auth, with a DB-backed revocation list
- **class-validator / class-transformer** for request validation
- **Swagger** at `/api/docs`
- **Helmet** + **@nestjs/throttler** (rate limiting) on by default

> **Why TypeORM and not Prisma:** Prisma's CLI needs to download a native
> engine binary from `binaries.prisma.sh` even just to run `generate` — in a
> network-restricted environment that host isn't reachable, and the build
> hard-fails. TypeORM is pure TypeScript/JS with no native binary step, so it
> was used instead. Functionally equivalent for this project.

## Setup

```bash
npm install
cp .env.example .env
# edit .env — set DATABASE_URL to your Postgres instance
npm run start:dev
```

`synchronize` is on outside `production` (see `src/database/database.module.ts`),
so the six `jobportal_*` tables are created automatically on first boot — no
migration step needed for local dev. For production, turn `synchronize` off
and manage schema with TypeORM migrations.

Seed two demo users + one listing:
```bash
npm run seed
```

Swagger UI: `http://localhost:4000/api/docs`

## Database tables

| Table | Purpose |
|---|---|
| `jobportal_users` | Local mirror of the central-auth account + this module's profile/role |
| `jobportal_sessions` | One row per issued local JWT — enables logout/revocation |
| `jobportal_properties` | Property listings |
| `jobportal_property_images` | Images per listing |
| `jobportal_favorites` | Saved/bookmarked properties |
| `jobportal_inquiries` | Buyer → seller contact messages on a listing |

## Endpoints

**Auth** (`/api/v1/auth`) — all proxy to central auth internally
- `POST /register` — `{ email, password, phone, role? }` (role: BUYER/SELLER/AGENT, default BUYER)
- `POST /login` — `{ identifier, password }`
- `GET /me` — current user (requires Bearer token)
- `POST /logout` — revoke the current session
- `POST /logout-all` — revoke every session

**Users** (`/api/v1/users`)
- `PATCH /profile` — update profile (best-effort synced back to central auth)
- `PATCH /role` — switch between BUYER / SELLER / AGENT
- `GET /agents` — public directory of sellers/agents (filter by city)
- `GET /:id` — public profile of any user

**Properties** (`/api/v1/properties`)
- `POST /` — create a listing (SELLER/AGENT only; starts as `PENDING_REVIEW`)
- `GET /` — browse published listings (filters: city, state, propertyType,
  listingType, minPrice, maxPrice, bedrooms, search, sortBy, page, limit)
- `GET /mine` — your own listings, any status
- `GET /admin/pending` — admin: approval queue
- `GET /:id` — listing detail (bumps the view counter unless you're the owner)
- `PATCH /:id` — edit your own listing
- `PATCH /:id/status` — owners can withdraw/archive/mark sold-or-rented;
  only ADMIN can approve (`PUBLISHED`) or `REJECT`
- `DELETE /:id`

**Favorites** (`/api/v1/favorites`) — `GET /`, `POST /:propertyId`, `DELETE /:propertyId`

**Inquiries** (`/api/v1/inquiries`)
- `POST /property/:propertyId` — contact a listing's owner
- `GET /sent` — inquiries you've sent
- `GET /received` — inquiries received on your listings (SELLER/AGENT)
- `PATCH /:id/status` — mark contacted/closed

All error responses use the same shape as the Central Auth API:
```json
{ "success": false, "statusCode": 401, "message": "...", "error": "...", "path": "...", "timestamp": "..." }
```

## Project structure

```
src/
  main.ts                     bootstrap: helmet, CORS, versioning, Swagger, global filter/pipe
  app.module.ts                wires everything + global guards (JWT, roles, throttle)
  config/configuration.ts      env var loader
  database/
    entities/                  User, Session, Property, PropertyImage, Favorite, Inquiry
    database.module.ts         TypeOrmModule setup (global)
    seed.ts                    demo data script
  common/
    guards/                    JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard
    decorators/                @Public(), @OptionalAuth(), @Roles(), @CurrentUser()
    filters/                   central-auth-shaped error responses
    utils/                     duration parsing, user sanitization
    enums/                     PortalRole, PropertyType, ListingType, etc.
  modules/
    central-auth/               the ONLY place that calls mainbackend.pavitramindia.com
    auth/                       register/login/me/logout — issues local JWTs
    users/                      profile, role switching, agents directory
    properties/                 listing CRUD + moderation
    favorites/
    inquiries/
```
