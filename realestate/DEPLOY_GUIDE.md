# Deploy Guide — Pavitram Real Estate (Backend + Frontend) → Hostinger VPS

**Domains:**
- Frontend → `realestate.pavitramindia.com`
- Backend → `backend.pavitramindia.com`

**Infra reused as-is (no new database, no new MinIO instance):**
- Postgres: same `pavitram_db` database, same user, reached via `host.docker.internal:32768`
- MinIO: same instance, reached via `host.docker.internal:9000` — but a **separate bucket**
  (`realestate`) so property images don't mix with the ecommerce project's `ecommerce` bucket
- Our new Postgres tables are 100% isolated by the `realnew_` prefix (see
  `backend/prisma/schema.prisma`) — nothing from the ecommerce/main projects is touched.

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

## Step 1 — Create a separate MinIO bucket for real estate images

Reuses the SAME MinIO instance/credentials, just a new bucket so images don't mix.
Note the `--entrypoint sh` — the `minio/mc` image's default command is already `mc`,
so you must override it to get a shell:
```bash
docker run --rm --entrypoint sh --add-host=host.docker.internal:host-gateway \
  minio/mc:latest -c "
    mc alias set myminio http://host.docker.internal:9000 'pavitramindiaoffice@gmail.com' 'P*v1tram*2o26' &&
    mc mb myminio/realestate
  "
```
If this errors on the password, that confirms Step 0's suspicion — get the real
`AWS_SECRET_ACCESS_KEY` from wherever the ecommerce backend's actual `.env` lives and retry.

(Skip this step entirely if you're not wiring up image uploads yet — the backend
currently stores property images as plain URLs.)

---

## Step 2 — DNS (skip if already done)

You mentioned both domains are already added — just confirm:
```bash
ping realestate.pavitramindia.com
ping backend.pavitramindia.com
```
Both should resolve to your VPS IP.

---

## Step 3 — Clone the repo into its own directory

```bash
cd /var/www/realestatenew        # the folder you already created
git clone https://github.com/aayushdha/PVITRAM-REALESATE-NEW.git .
```
(the trailing `.` clones directly into the current folder instead of making a
nested subfolder — use this if the folder is already named the way you want)

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
2. Confirm `BACKEND_PORT=4010` / `FRONTEND_PORT=3010` are still free:
   ```bash
   sudo ss -tulpn | grep -E ':4010|:3010'
   ```
   (no output = free = good)

Save: `Ctrl+O` → Enter → `Ctrl+X`

---

## Step 5 — Build + run

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f realestate-backend
```
Look for `Pavitram Real Estate API running on :4000`, then `Ctrl+C`.

Confirm the new tables landed correctly (and nothing else changed):
```bash
docker exec -it postgresql-kv0r-postgresql-1 psql -U pavitramindiaoffice@gmail.com -d pavitram_db -c "\dt public.realnew_*"
```

---

## Step 6 — Nginx — how the ports connect to the domains

Each domain gets one Nginx file that says "requests for this domain → forward to
this local port". That's the **only** place the port-to-domain mapping lives:

```bash
sudo cp nginx/realestate.pavitramindia.com.conf /etc/nginx/sites-available/
sudo cp nginx/backend.pavitramindia.com.conf /etc/nginx/sites-available/

sudo ln -s /etc/nginx/sites-available/realestate.pavitramindia.com.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/backend.pavitramindia.com.conf /etc/nginx/sites-enabled/

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
sudo certbot --nginx -d realestate.pavitramindia.com
sudo certbot --nginx -d backend.pavitramindia.com
```

Verify:
```bash
curl https://backend.pavitramindia.com/api/v1/properties
```
Browser: `https://realestate.pavitramindia.com`

---

## Step 8 — Auto-deploy via GitHub Actions (one-time setup)

```bash
ssh-keygen -t ed25519 -f pavitram_deploy_key -N ""
cat pavitram_deploy_key.pub | ssh root@YOUR_VPS_IP "cat >> ~/.ssh/authorized_keys"
```

GitHub repo → **Settings → Secrets and variables → Actions** → add:

| Secret | Value |
|---|---|
| `VPS_HOST` | VPS IP |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | full private key content |
| `VPS_PORT` | `22` |
| `PROJECT_PATH` | `/var/www/realestatenew` |

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
  (`docker --version`); if older, replace the host inside `DATABASE_URL` and `MINIO_ENDPOINT` with the VPS's
  internal IP from `hostname -I`.
