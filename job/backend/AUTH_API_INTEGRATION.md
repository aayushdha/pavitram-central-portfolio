# Pavitram Central Auth API — Integration Guide

Yeh backend (`mainbackend.pavitramindia.com`) auth ke liye **central/single source of
truth** ban sakta hai. Ecommerce, realestate, ya koi bhi doosra module isi ek jagah
signup/signin karwa sakta hai, aur wahi JWT token apne saare API calls me use kar
sakta hai.

**Base URL:** `https://mainbackend.pavitramindia.com/api/v1`

---

## 1. Signup — `POST /auth/signup`

Naya account banata hai (role hamesha `USER` se start hota hai).

**Request body:**
```json
{
  "email": "rahul@example.com",
  "password": "MyPass123",
  "phone": "9876543210"
}
```

**Success response — `201 Created`:**
```json
{
  "message": "Account created successfully",
  "user": {
    "id": "clx1a2b3c4d5e6f7g8h9",
    "name": "",
    "email": "rahul@example.com",
    "phone": "9876543210",
    "role": "USER",
    "avatarUrl": null,
    "accountStatus": "ACTIVE",
    "kycStatus": "PENDING",
    "isOnboarded": false,
    "address": null,
    "city": null,
    "state": null,
    "profession": null,
    "designation": null,
    "organization": null,
    "reference": null
  }
}
```

**Error response — `409 Conflict`** (email/phone already registered):
```json
{
  "success": false,
  "statusCode": 409,
  "message": "An account with this email already exists",
  "error": "ConflictException",
  "path": "/api/v1/auth/signup",
  "timestamp": "2026-09-05T10:00:00.000Z"
}
```

> Note: signup sirf email/password/phone leta hai. Naam, address, profession
> waghera baad me "profile update" endpoint se add hote hain (onboarding flow).

---

## 2. Signin (Login) — `POST /auth/signin`

Email **ya** phone dono se login ho sakta hai (`identifier` field).

**Request body:**
```json
{
  "identifier": "rahul@example.com",
  "password": "MyPass123"
}
```
(`identifier` me email ki jagah phone number bhi de sakte ho)

**Success response — `200 OK`:**
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx1a2b3c4d5e6f7g8h9",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phone": "9876543210",
    "role": "USER",
    "avatarUrl": null,
    "accountStatus": "ACTIVE",
    "kycStatus": "PENDING",
    "isOnboarded": true,
    "address": "Indore",
    "city": "Indore",
    "state": "Madhya Pradesh",
    "profession": "Business",
    "designation": "Owner",
    "organization": "ABC Traders",
    "reference": null
  }
}
```

**Error response — `401 Unauthorized`** (galat email/password, ya suspended account):
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid email/phone or password",
  "error": "UnauthorizedException",
  "path": "/api/v1/auth/signin",
  "timestamp": "2026-09-05T10:00:00.000Z"
}
```

**`access_token` ko store karo** (localStorage/cookie/session — jo bhi module ka
pattern ho) aur har protected request me isse bhejo:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3. Validate Token / Get Current User — `GET /auth/me`

Doosra module isse use karke check kar sakta hai ki token abhi bhi valid hai ya nahi
(login state verify karne ke liye).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success response — `200 OK`:**
```json
{
  "message": "Token is valid",
  "user": {
    "userId": "clx1a2b3c4d5e6f7g8h9",
    "email": "rahul@example.com",
    "role": "USER"
  }
}
```

**Error response — `401 Unauthorized`** (token expired/invalid/missing):
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "UnauthorizedException",
  "path": "/api/v1/auth/me",
  "timestamp": "2026-09-05T10:00:00.000Z"
}
```

---

## 4. Update Profile — `PATCH /auth/profile`

Onboarding / profile-completion ke liye. Sabhi fields optional hain — jo bhejoge
wahi update hoga.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request body (jo chahiye wo bhejo):**
```json
{
  "name": "Rahul Sharma",
  "phone": "9876543210",
  "address": "MG Road",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "profession": "Business",
  "designation": "Owner",
  "organization": "ABC Traders"
}
```

**Success response — `200 OK`:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "clx1a2b3c4d5e6f7g8h9",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "phone": "9876543210",
    "role": "USER",
    "avatarUrl": null,
    "accountStatus": "ACTIVE",
    "kycStatus": "PENDING",
    "isOnboarded": true,
    "address": "MG Road",
    "city": "Indore",
    "state": "Madhya Pradesh",
    "profession": "Business",
    "designation": "Owner",
    "organization": "ABC Traders",
    "reference": null
  }
}
```

---

## User Roles (`role` field)

| Role | Matlab |
|---|---|
| `USER` | Normal member — ecommerce/realestate customer |
| `ADMIN` | Pavitram Super Admin panel access |
| `SUPER_ADMIN` | Full admin access, dusre admins bana sakta hai |

Doosre modules ke liye `USER` role hi relevant hai — `role: "USER"` dekh kar
confirm kar sakte ho yeh ek normal customer account hai.

## Account Status Check

Login se pehle/baad `accountStatus` field zaroor check karo:
- `ACTIVE` — normal
- `SUSPENDED` — backend khud login block kar dega (401 dega), koi extra check nahi chahiye
- `INACTIVE` — module apni marzi se restrict kar sakta hai

---

## Realestate / Ecommerce Integration — SSO Pattern

Do tarike se integrate kar sakte ho:

### Tarika A — Direct Shared Login (Recommended)
Doosra module apna alag login form na banaye, seedha in hi 2 endpoints
(`/auth/signup`, `/auth/signin`) ko call kare apne frontend se. Response me mila
`access_token` apne khud ke session/cookie me store kar le. Har user, chahe
ecommerce se aaya ho ya realestate se, **isi ek `main_users` table me** rehta hai.

### Tarika B — Token Handoff (jaisa Properties/SSO ke liye already banaya gaya hai)
Agar user pehle se Pavitram main site par login hai aur doosre module par
"redirect" hokar jana hai:
1. Main site apna `access_token` query param me pass kare:
   `https://ecommerce.pavitramindia.com/sso?pavitram_token=<access_token>`
2. Doosra module yeh token receive kare, apne localStorage me save kare
3. Har API call me `Authorization: Bearer <token>` bhejta rahe
4. Token validate karne ke liye `GET /auth/me` call kar sakta hai

---

## Quick Test (curl)

```bash
# Signup
curl -X POST https://mainbackend.pavitramindia.com/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","phone":"9998887777"}'

# Signin
curl -X POST https://mainbackend.pavitramindia.com/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"Test1234"}'

# Validate token
curl https://mainbackend.pavitramindia.com/api/v1/auth/me \
  -H "Authorization: Bearer <access_token_yaha_daalo>"
```

---

## Zaroori Setup Baaki Modules Ke Liye

Ecommerce/realestate backend ke `.env` me sirf itna add karna hoga (CORS allow
karne ke liye), Pavitram backend ki `.env` me:
```
CORS_ORIGINS=https://pavitramindia.com,https://www.pavitramindia.com,https://ecommercedomain.com,https://realestatedomain.com
```
(apna actual ecommerce/realestate ka live domain daalo, comma se separate)

Isके bina un domains se browser se seedhi API calls **CORS block** ho jayengi.
