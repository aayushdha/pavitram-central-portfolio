# Deploying to your Hostinger VPS (existing Postgres + MinIO, zero data loss)

Your VPS already runs a shared PostgreSQL (`pavitram_db`, schema `ecom`) and a
MinIO bucket (`ecommerce`) for another project. This guide sets up the
Pavitram backend **alongside** them without touching that data:

- A brand-new PostgreSQL **schema** (`pavitram`) inside the same database —
  all tables (`main_*`) live only here. The `ecom` schema is never read,
  altered, or dropped.
- A **folder prefix** (`pavitram/`) inside the same `ecommerce` MinIO bucket —
  uploads never overwrite or list existing files outside that prefix.
- A dedicated PM2 process name (`pavitram-backend`) and its own Nginx server
  block — nothing shared with other apps on the box.

## 1. One-time: create the isolated database schema

SSH into the VPS (or wherever `200.97.171.20` is reachable from) and connect:

```bash
psql "postgresql://pavitramindiaoffice%40gmail.com:P%40v1tram%402o26@200.97.171.20:32769/pavitram_db"
```

```sql
CREATE SCHEMA IF NOT EXISTS pavitram;
\q
```

This adds a new, empty namespace next to `ecom` in the same database.
Nothing in `ecom` is touched.

> If this fails with a permission error, the `pavitramindiaoffice@gmail.com`
> user isn't the DB owner — ask whoever manages that Postgres instance to run
> the command above once.

## 2. One-time: scope the MinIO bucket prefix to public-read

Only the `pavitram/` folder needs to be publicly viewable (for images shown
on the website) — the rest of the `ecommerce` bucket's permissions are
untouched.

```bash
curl https://dl.min.io/client/mc/release/linux-amd64/mc -o mc
chmod +x mc && sudo mv mc /usr/local/bin/

mc alias set pavitram-minio http://200.97.171.20:9000 \
  'pavitramindiaoffice@gmail.com' 'P*v1tram*2o26'

mc anonymous set download pavitram-minio/ecommerce/pavitram
```

## 3. One-time: first manual deploy

```bash
sudo mkdir -p /var/www/pavitram-backend
sudo chown $USER:$USER /var/www/pavitram-backend
cd /var/www/pavitram-backend

git clone <your-github-repo-url> .
```

Create `.env` directly on the server (use the corrected values given to you —
**never commit this file to Git**, it's already in `.gitignore`):

```bash
nano .env
```

Then:

```bash
npm install
npx prisma migrate deploy      # creates main_* tables inside the "pavitram" schema only
npm run seed                    # real content + your Super Admin account
npm run build

pm2 start dist/main.js --name pavitram-backend
pm2 save
```

Set up Nginx + SSL for a new subdomain (e.g. `api.pavitramindia.com`) exactly
as in the earlier VPS guide — a new `sites-available` file, its own Certbot
cert, nothing shared with the frontend's existing config.

## 4. GitHub Actions pipeline (auto-deploy on push)

The workflow is already in this repo at `.github/workflows/deploy.yml`. It
does `git pull → npm ci → prisma migrate deploy → build → pm2 restart` over
SSH every time you push to `main`.

### 4a. Push this code to a **private** GitHub repo

```bash
cd pavitram-backend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/pavitram-backend.git
git push -u origin main
```

(`.env` is git-ignored — your real credentials never reach GitHub.)

### 4b. Generate a dedicated deploy key (don't reuse your personal SSH key)

On your own machine:

```bash
ssh-keygen -t ed25519 -f pavitram_deploy_key -N ""
```

Copy the **public** key to the VPS:

```bash
ssh-copy-id -i pavitram_deploy_key.pub root@200.97.171.20
```

(or manually append `pavitram_deploy_key.pub`'s contents to
`~/.ssh/authorized_keys` on the VPS)

### 4c. Add GitHub Secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
|---|---|
| `VPS_HOST` | `200.97.171.20` |
| `VPS_USERNAME` | your SSH user (e.g. `root`) |
| `VPS_SSH_KEY` | contents of `pavitram_deploy_key` (the **private** key file) |
| `VPS_PORT` | `22` (or your custom SSH port) |
| `VPS_APP_DIR` | `/var/www/pavitram-backend` |

### 4d. Deploy

From now on, every `git push origin main` automatically deploys:

```bash
git add .
git commit -m "update services"
git push origin main
```

Watch it run under the repo's **Actions** tab.

## Safety notes

- The pipeline never runs `prisma migrate reset` (which would drop data) —
  only `migrate deploy`, which is additive/non-destructive by design.
- Because everything lives in the `pavitram` schema and `pavitram/` bucket
  prefix, none of these commands can read, alter, or delete anything
  belonging to the existing `ecom` project.
- `.env` is created once, by hand, directly on the server — the pipeline
  never touches or overwrites it.
