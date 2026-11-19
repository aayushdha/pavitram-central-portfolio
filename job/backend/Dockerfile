# ============================================================================
# Pavitram JobPortal — Backend (NestJS) — production image
# ============================================================================

# ---- deps: install all deps (incl. dev, needed to build) ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- build: compile TS ----
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- prod deps only ----
FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ---- runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER nestjs
EXPOSE 4000

# TypeORM synchronize (DB_SYNCHRONIZE=true) creates/updates the jobportal_*
# tables on boot — no separate migrate step needed, unlike Prisma.
CMD ["node", "dist/main"]
