#!/usr/bin/env bash
# Run this ON THE VPS (from the repo folder) and paste the whole output back:
#     bash scripts/vps-diagnose.sh
# It checks every link of:  browser -> nginx -> frontend container -> backend container -> Central Auth.
# It never creates accounts (it only tries a login with a fake user).

FE="${FRONTEND_URL:-https://jobportal.pavitramindia.com}"
FE_C="${FRONTEND_CONTAINER:-pavitram-jobportal-frontend}"
BE_C="${BACKEND_CONTAINER:-pavitram-jobportal-backend}"
hr() { printf '\n\033[1m== %s\033[0m\n' "$1"; }
HAVE_DOCKER=1; command -v docker >/dev/null 2>&1 || HAVE_DOCKER=0

hr "1. Containers (both must say Up, and 'Up' time must be recent after a deploy)"
if [ $HAVE_DOCKER = 1 ]; then docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -E 'NAMES|jobportal'; else echo "docker not found - run this on the VPS"; fi

hr "2. What the browser does: public site -> /api/v1/health"
curl -sS -m 20 -i "$FE/api/v1/health" 2>&1 | head -12

hr "3. Public site -> POST /api/v1/auth/login with a FAKE user (expect HTTP 401 or 400, NOT 5xx / reset)"
curl -sS -m 40 -i -X POST "$FE/api/v1/auth/login" -H 'Content-Type: application/json' \
  -d '{"identifier":"nobody-diag@example.com","password":"WrongPass123"}' 2>&1 | head -12

hr "4. Which API address is baked into the frontend JavaScript (should be NOTHING / only the site itself)"
JS=$(curl -s -m 20 "$FE/signup" | grep -o '/_next/static/[^"]*\.js' | sort -u)
if [ -z "$JS" ]; then echo "could not load $FE/signup"; else
  for f in $JS; do curl -s -m 20 "$FE$f"; done | grep -oE 'https?://[A-Za-z0-9.-]*(pavitramindia|localhost)[A-Za-z0-9.:/_-]*' | sort | uniq -c
  echo "(end of list)"
fi

if [ $HAVE_DOCKER = 1 ]; then
  hr "5. Frontend container -> backend container (expect {\"status\":\"ok\"...})"
  docker exec "$FE_C" wget -qO- -T 10 http://jobportal-backend:4000/api/v1/health 2>&1 | head -3; echo

  hr "6. Backend container -> Central Auth (expect 'central auth HTTP 400/401/404', NOT 'UNREACHABLE')"
  docker exec "$BE_C" node -e "
    const u=(process.env.CENTRAL_AUTH_BASE_URL||'')+'/auth/signin'; console.log('calling',u);
    fetch(u,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({identifier:'nobody-diag@example.com',password:'WrongPass123'}),signal:AbortSignal.timeout(20000)})
      .then(async r=>console.log('central auth HTTP',r.status,(await r.text()).slice(0,160)))
      .catch(e=>console.log('CENTRAL AUTH UNREACHABLE:',(e.cause&&e.cause.code)||e.message))" 2>&1 | head -5

  hr "7. Backend env sanity (values hidden)"
  docker exec "$BE_C" sh -c 'for v in DATABASE_URL JWT_SECRET CORS_ORIGINS CENTRAL_AUTH_BASE_URL; do eval val=\${$v}; if [ -z "$val" ]; then echo "$v = MISSING"; else echo "$v = set (${#val} chars)"; fi; done; echo "CORS_ORIGINS=$CORS_ORIGINS"'

  hr "8. Last backend log lines"
  docker logs --tail 25 "$BE_C" 2>&1 | sed -E 's#(postgresql://)[^@]*@#\1***@#'
  hr "9. Last frontend log lines"
  docker logs --tail 25 "$FE_C" 2>&1
fi
hr "done - paste everything above"
