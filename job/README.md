# Pavitram JobPortal — Monorepo

- `backend/` — NestJS API (see `backend/README.md` for module/route details)
- `frontend/` — Next.js app (`jobconnect`)
- `docker-compose.prod.yml` — defines only the two containers for this project
  (`jobportal-backend`, `jobportal-frontend`); reaches the VPS's existing
  Postgres (already published on a host port) via `host.docker.internal` —
  reuses the existing database, adding only `jobportal_`-prefixed tables
- `nginx/` — reverse-proxy configs for the two new subdomains
- `.github/workflows/deploy.yml` — push to `main` → auto-deploys to the VPS over SSH

**Start here → [`DEPLOY_GUIDE.md`](./DEPLOY_GUIDE.md)** for the full, step-by-step
first-time setup (real DB password, DNS, Nginx + Certbot, GitHub Actions secrets).

Once set up once, every `git push origin main` auto-deploys — nothing else on the
VPS is affected.
