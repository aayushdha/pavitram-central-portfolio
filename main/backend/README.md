# Pavitram India — Backend (NestJS + PostgreSQL + Prisma)

Complete backend and CMS API powering the Pavitram India website, member
dashboard, and Super Admin Panel. Every database table is prefixed
`main_` as requested.

## Stack

- **NestJS 10** (TypeScript)
- **PostgreSQL** via **Prisma ORM**
- **JWT** authentication (roles: `USER`, `ADMIN`, `SUPER_ADMIN`)
- **Multer** for image uploads (served from `/uploads`)

## 1. Install

```bash
npm install
```

## 2. Configure

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_SECRET` — a long random string
- `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PHONE` / `SUPER_ADMIN_PASSWORD` — the account
  the seed script creates for you to log into the Super Admin Panel

If you don't have PostgreSQL installed, the quickest option is Docker:

```bash
docker run --name pavitram-db -e POSTGRES_USER=pavitram -e POSTGRES_PASSWORD=pavitram \
  -e POSTGRES_DB=pavitram_db -p 5432:5432 -d postgres:16
```

(matches the default `DATABASE_URL` in `.env.example`)

## 3. Create the database schema

```bash
npx prisma migrate dev --name init
```

This creates every `main_*` table from `prisma/schema.prisma`.

## 4. Seed real starter content

```bash
npm run seed
```

This populates the database with:
- 13 services (Mart, Wellness, Gyan, Technology, Finance, Travels, Rishta, Rozgar,
  Services, Media, Delivery, Properties, Foundation) with full detail-page content
- 4 opportunities (Consumer, Merchant, Investor, Career)
- 10 FAQs, 4 testimonials, 4 impact stats
- CMS pages/sections for Home, About + 7 sub-pages, Contact, Join, FAQ
- Site settings (contact info, social links, footer text)
- **One Super Admin account** — the email/phone/password from your `.env`

## 5. Run

```bash
npm run start:dev
```

The API is now live at `http://localhost:4000/api/v1`.

## Project structure

```
src/
  auth/            signup, signin, /me, profile — matches the frontend's existing contract
  users/            "Join the Community" public form + admin user management
  community/        Admin: approve/reject join requests
  contact/           Public contact form + admin inbox
  services/          13 service detail pages (CRUD + public read)
  opportunities/      4 opportunity pages (CRUD + public read)
  faqs/               FAQ CRUD
  testimonials/       Testimonial CRUD
  team/               Team/network member CRUD
  stats/              Homepage impact-stat CRUD
  pages/              Generic CMS: Pages -> Sections (About, Home narrative blocks, etc.)
  settings/           Site-wide key/value settings (logo, contact, socials, footer)
  media/              Image upload + library
  admin-dashboard/     Aggregate stats for the Super Admin dashboard
  common/             Guards, decorators, filters shared across modules
  prisma/             PrismaService (DB client)
prisma/
  schema.prisma       Full schema — every table prefixed main_
  seed.ts              Seed entrypoint
  seed-data.ts          Services + Opportunities seed content
  seed-data-2.ts         FAQs, testimonials, stats, team, pages, settings seed content
```

## API overview

All routes are prefixed `/api/v1`.

| Area | Public | Admin (ADMIN / SUPER_ADMIN only) |
|---|---|---|
| Auth | `POST /auth/signup`, `POST /auth/signin`, `GET /auth/me`, `PATCH /auth/profile` | — |
| Join Community | `POST /users/profile-form` | `GET/PATCH/DELETE /admin/community-members` |
| Contact | `POST /contact` | `GET/PATCH/DELETE /admin/contact-messages` |
| Services | `GET /services`, `GET /services/:slug` | full CRUD at `/admin/services` |
| Opportunities | `GET /opportunities`, `GET /opportunities/:slug` | full CRUD at `/admin/opportunities` |
| FAQs | `GET /faqs` | full CRUD at `/admin/faqs` |
| Testimonials | `GET /testimonials` | full CRUD at `/admin/testimonials` |
| Team | `GET /team` | full CRUD at `/admin/team` |
| Stats | `GET /stats` | full CRUD at `/admin/stats` |
| Pages/CMS | `GET /pages/:slug` | `GET/PUT /admin/pages`, `PUT /admin/pages/:slug/sections` |
| Settings | `GET /settings` | `GET/PUT /admin/settings`, `PUT /admin/settings/bulk` |
| Media | — | `POST /admin/media/upload`, `GET/DELETE /admin/media` |
| Users | — | full CRUD at `/admin/users` |
| Dashboard | — | `GET /admin/dashboard/stats` |

Authenticated requests use `Authorization: Bearer <token>` — the same token
returned from `/auth/signin`.

## Connecting the frontend

In the frontend project, set in `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Both the public site and the Super Admin Panel (`/super-admin`) will then talk to
this backend automatically.

## Production notes

- Set `NODE_ENV=production` and a strong `JWT_SECRET`.
- Run `npm run build && npm run start:prod`.
- Run `npx prisma migrate deploy` (not `migrate dev`) against your production database.
- Put the app behind HTTPS; set `CORS_ORIGINS` to your real frontend domain(s).
- Uploaded media is stored on local disk under `uploads/` — for multi-instance
  deployments, mount this as shared/persistent storage (or swap `MediaService`
  to write to S3-compatible storage).
