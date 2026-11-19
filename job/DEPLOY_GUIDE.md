# Deploy Guide — Pavitram JobPortal (Backend + Frontend) → Hostinger VPS

**Domains:**
- Frontend → `jobportal.pavitramindia.com`
- Backend → `jobportal-api.pavitramindia.com`

**Infra reused as-is (no new database, no new MinIO instance):**
- Postgres: same `pavitram_db` database, same user, reached via `host.docker.internal:32768`
- MinIO: same instance, reached via `host.docker.internal:9000` — but a **separate bucket**
  (`jobportal`) so property images don't mix with any other project's bucket
- Our new Postgres tables are 100% isolated by the `jobportal_` prefix (see
  `backend/src/database/entities/`) — nothing from the ecommerce/realestate/main
  projects is touched.

---

## Step 0 — ⚠️ Verify the reused credentials first

The `.env` you shared had a note that some characters got corrupted during text
extraction and were "best-guess" reconstructed. Before deploying, confirm the real
values, e.g.:
```bash
# on the VPS, find the ecommerce backend's actual running env
docker exec -it <ecommerce_backend_container> printenv | grep -E "DATABASE_URL|AWS_"
```
Compare against what's in `.env.production.example` — fix if different.

---

## Step 1 — Create a separate MinIO bucket for job/property images

Reuses the SAME MinIO instance/credentials, just a new bucket so images don't mix.
Note the `--entrypoint sh` — the `minio/mc` image's default command is already `mc`,
so you must override it to get a shell:
```bash
docker run --rm --entrypoint sh --add-host=host.docker.internal:host-gateway \
  minio/mc:latest -c "
    mc alias set myminio http://host.docker.internal:9000 'pavitramindiaoffice@gmail.com' 'P*v1tram*2o26' &&
    mc mb myminio/jobportal
  "
```
If this errors on the password, that confirms Step 0's suspicion — get the real
`AWS_SECRET_ACCESS_KEY` from wherever the ecommerce backend's actual `.env` lives and retry.

(Skip this step entirely for now — the backend currently stores property images as
plain URLs, not real uploads. Do this when that feature is added.)

---

## Step 2 — DNS

Add two **A records** in your DNS panel, both pointing at the VPS's public IP:

| Type | Name | Value |
|---|---|---|
| A | `jobportal` | `<vps-public-ip>` |
| A | `jobportal-api` | `<vps-public-ip>` |

Confirm once added:
```bash
ping jobportal.pavitramindia.com
ping jobportal-api.pavitramindia.com
```
Both should resolve to your VPS IP (may take a few minutes to propagate).

---

## Step 3 — Clone the repo into its own directory

```bash
sudo mkdir -p /var/www/jobportal
sudo chown $USER:$USER /var/www/jobportal
cd /var/www/jobportal
git clone https://github.com/<your-username>/<your-repo>.git .
```
(the trailing `.` clones directly into the current folder instead of making a
nested subfolder)

If it asks for a password: use a **GitHub Personal Access Token**, not your account
password (GitHub Settings → Developer settings → Personal access tokens).

---

## Step 4 — Configure `.env`

```bash
cp .env.production.example .env
nano .env
```
The file already has the real, reused `DATABASE_URL` and MinIO values filled in
(one single connection-string line — no need to split it into separate
host/user/password fields). Just:
1. Re-verify the password inside `DATABASE_URL` and `MINIO_SECRET_KEY` per Step 0
2. Set `JWT_SECRET` to a fresh random value: `openssl rand -hex 32`
3. Confirm `BACKEND_PORT=4020` / `FRONTEND_PORT=3020` are still free:
   ```bash
   sudo ss -tulpn | grep -E ':4020|:3020'
   ```
   (no output = free = good — the realestate project already took 4010/3010,
   so 4020/3020 are the next pair in the same pattern, but double-check anyway)

Save: `Ctrl+O` → Enter → `Ctrl+X`

---

## Step 5 — Build + run

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f jobportal-backend
```
Look for `JobPortal backend running on http://localhost:4000/api`, then `Ctrl+C`.

Confirm the new tables landed correctly (and nothing else changed):
```bash
docker exec -it <postgres_container_name> psql -U pavitramindiaoffice@gmail.com -d pavitram_db -c "\dt public.jobportal_*"
```

---

## Step 6 — Nginx — how the ports connect to the domains

Each domain gets one Nginx file that says "requests for this domain → forward to
this local port". That's the **only** place the port-to-domain mapping lives:

```bash
sudo cp nginx/jobportal.pavitramindia.com.conf /etc/nginx/sites-available/
sudo cp nginx/jobportal-api.pavitramindia.com.conf /etc/nginx/sites-available/

sudo ln -s /etc/nginx/sites-available/jobportal.pavitramindia.com.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/jobportal-api.pavitramindia.com.conf /etc/nginx/sites-enabled/

sudo nginx -t && sudo systemctl reload nginx
```

**If you ever need to change a port** (say the current one gets taken by something
else later):
1. Change it in `.env` (`BACKEND_PORT` or `FRONTEND_PORT`)
2. Change the matching `proxy_pass http://127.0.0.1:<PORT>;` line in the matching
   `/etc/nginx/sites-available/<domain>.conf` file — **both numbers must always match**
3. `sudo nginx -t && sudo systemctl reload nginx`
4. `docker compose -f docker-compose.prod.yml up -d` (re-applies the new `.env` port)

---

## Step 7 — SSL

```bash
sudo certbot --nginx -d jobportal.pavitramindia.com
sudo certbot --nginx -d jobportal-api.pavitramindia.com
```

Verify:
```bash
curl https://jobportal-api.pavitramindia.com/api/v1/health
```
Browser: `https://jobportal.pavitramindia.com`

---

## Step 8 — Auto-deploy via GitHub Actions (one-time setup)

```bash
ssh-keygen -t ed25519 -f jobportal_deploy_key -N ""
cat jobportal_deploy_key.pub | ssh root@YOUR_VPS_IP "cat >> ~/.ssh/authorized_keys"
```

GitHub repo → **Settings → Secrets and variables → Actions** → add:

| Secret | Value |
|---|---|
| `VPS_HOST` | VPS IP |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | full private key content |
| `VPS_PORT` | `22` |
| `PROJECT_PATH` | `/var/www/jobportal` |

Then just:
```bash
git push origin main
```
and check the **Actions** tab on GitHub.

---

## Troubleshooting

- **DB auth fails** → password mismatch (see Step 0), or a typo in the
  `DATABASE_URL` line in `.env` — remember `@` inside the username/password
  themselves must stay URL-encoded as `%40` (only the `@` separating
  user:password from host should be a literal `@`).
- **502 Bad Gateway** → `docker compose -f docker-compose.prod.yml ps` — is the
  container "Up"? Does the Nginx `proxy_pass` port match `.env`?
- **MinIO bucket create fails** → wrong access/secret key (see Step 0/1).
- **`host.docker.internal` not resolving** → needs Docker Engine 20.10+
  (`docker --version`); if older, replace the host inside `DATABASE_URL` and
  `MINIO_ENDPOINT` with the VPS's internal IP from `hostname -I`.
- **Tables ended up in the wrong schema** → check `DB_SCHEMA` in `.env` matches
  what's in `DATABASE_URL`'s `?schema=` (they should both say `public`).
