#!/usr/bin/env bash
# ============================================================================
# JobConnect — "why does signup say 'Something went wrong'?" checker.
# Run ON THE VPS, inside the project folder (next to docker-compose.prod.yml):
#       bash diagnose-vps.sh
# It only READS things (no changes) and never prints passwords or secrets.
# ============================================================================
set -u
COMPOSE="docker compose -f docker-compose.prod.yml"
[ -f .env ] || { echo "No .env in $(pwd). cd into the project folder first."; exit 1; }

val() { grep -E "^$1=" .env | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//'; }
BP=$(val BACKEND_PORT); FP=$(val FRONTEND_PORT)
FU=$(val FRONTEND_PUBLIC_URL); BU=$(val BACKEND_PUBLIC_URL)
CENTRAL=$(val CENTRAL_AUTH_BASE_URL); CENTRAL=${CENTRAL:-https://mainbackend.pavitramindia.com/api/v1}

ok()   { echo "   [ OK ]  $*"; }
bad()  { echo "   [FAIL]  $*"; FAILS=$((FAILS+1)); }
note() { echo "           $*"; }
FAILS=0

echo "1) .env values"
echo "   FRONTEND_PUBLIC_URL = ${FU:-<EMPTY>}"
echo "   BACKEND_PUBLIC_URL  = ${BU:-<EMPTY>}"
[ -z "$FU" ] && bad "FRONTEND_PUBLIC_URL is empty -> the backend will block the website (CORS)."
[ -z "$BU" ] && bad "BACKEND_PUBLIC_URL is empty -> the website was built pointing at localhost:4000."
case "$BU" in http://*) bad "BACKEND_PUBLIC_URL uses http:// but the site is https:// -> browser blocks it (mixed content).";; esac
case "$BU" in */) note "BACKEND_PUBLIC_URL ends with '/': remove it (the new code tolerates it, still tidy).";; esac
case "$FU" in */) note "FRONTEND_PUBLIC_URL ends with '/': remove it (the new code tolerates it, still tidy).";; esac
case "$BU$FU" in *localhost*) bad "A PUBLIC_URL contains 'localhost'.";; esac

echo; echo "2) containers"
$COMPOSE ps --format '   {{.Service}}: {{.State}} ({{.Status}})' 2>/dev/null || $COMPOSE ps

echo; echo "3) backend answers on the VPS itself (port $BP)"
CODE=$(curl -s -o /dev/null -m 8 -w '%{http_code}' "http://127.0.0.1:${BP}/api/v1/health")
[ "$CODE" = "200" ] && ok "http://127.0.0.1:${BP}/api/v1/health -> 200" \
  || { bad "got HTTP $CODE (000 = nothing listening). Backend crashed? see step 8."; }

echo; echo "4) backend answers from the PUBLIC internet ($BU)"
OUT=$(curl -sS -m 12 -o /dev/null -w '%{http_code}' "$BU/api/v1/health" 2>&1)
case "$OUT" in
  200) ok "$BU/api/v1/health -> 200";;
  000*|curl*) bad "cannot connect: $OUT"
      note "-> DNS record for the API sub-domain missing, nginx site not enabled, or SSL (certbot) not issued."
      note "   Fix: DEPLOY_GUIDE.md steps 2, 6, 7  (A record, nginx conf, certbot).";;
  502|503|504) bad "nginx is up but the backend isn't ($OUT). Does nginx proxy_pass use port $BP ?";;
  404) bad "got 404 - the domain reaches a DIFFERENT site. Check server_name in the nginx conf.";;
  *) bad "unexpected HTTP $OUT";;
esac

echo; echo "5) CORS: will the browser be allowed to call the API from $FU ?"
HDR=$(curl -si -m 12 -X OPTIONS "$BU/api/v1/auth/register" -H "Origin: $FU" \
      -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type" 2>/dev/null \
      | grep -i '^access-control-allow-origin' | tr -d '\r')
if [ -n "$HDR" ]; then ok "$HDR"; else
  bad "no Access-Control-Allow-Origin header -> the browser blocks signup."
  note "-> FRONTEND_PUBLIC_URL in .env must be exactly the website address (https, no typo)."; fi

echo; echo "6) which API address is baked into the website you deployed"
BAKED=$(docker exec pavitram-jobportal-frontend sh -c "grep -rhoE 'https?://[A-Za-z0-9.-]+(:[0-9]+)?' .next/static 2>/dev/null | grep -E 'pavitramindia|localhost:4000' | sort | uniq -c | sort -rn | head -5" 2>/dev/null)
echo "${BAKED:-   (could not read the frontend container)}"
echo "$BAKED" | grep -q "localhost:4000" && bad "the website was built pointing at localhost:4000 -> BACKEND_PUBLIC_URL was empty at build time. Fix .env, then rebuild: $COMPOSE build --no-cache jobportal-frontend && $COMPOSE up -d"
echo "$BAKED" | grep -q "$(echo "$BU" | sed 's#https\?://##; s#/$##')" && ok "website points at $BU"

echo; echo "7) can the backend container reach the central auth service?"
R=$(docker exec pavitram-jobportal-backend node -e "fetch('${CENTRAL}/auth/me').then(r=>console.log('HTTP '+r.status)).catch(e=>console.log('ERR '+e.message))" 2>&1)
case "$R" in "HTTP 401"|"HTTP 200"|"HTTP 403") ok "central auth reachable ($R is expected without a token)";; *) bad "central auth: $R";; esac

echo; echo "8) recent backend log lines that matter"
$COMPOSE logs --tail=300 jobportal-backend 2>/dev/null | grep -iE "error|blocked|cors|unreachable|ECONN|ENOTFOUND|password authentication|started" | tail -12 | sed 's/^/   /'

echo; if [ "$FAILS" -eq 0 ]; then echo "Everything checked looks fine."; else echo "$FAILS problem(s) found - fix the first [FAIL] above, then run this script again."; fi
