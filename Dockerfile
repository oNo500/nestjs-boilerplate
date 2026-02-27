# syntax=docker/dockerfile:1

# ────────────────────────────────────────────
# Stage 1: Install dependencies + build
# ────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN apk add --no-cache python3 make g++ && \
    corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy each package's package.json (leverage Docker layer cache)
COPY packages/database/package.json ./packages/database/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY apps/api/package.json ./apps/api/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/database ./packages/database
COPY packages/eslint-config ./packages/eslint-config
COPY apps/api ./apps/api

# Build database package (api depends on its dist/)
RUN pnpm --filter @workspace/database build

# Build api
RUN pnpm --filter api build

# pnpm v10 requires --legacy to deploy workspace packages
# Output is a flat structure with complete workspace dependencies (including dist/)
RUN pnpm --filter api deploy --prod --legacy /app/deploy

# pnpm deploy only copies node_modules, not build artifacts — copy manually
RUN cp -r /app/apps/api/dist /app/deploy/dist

# ────────────────────────────────────────────
# Stage 2: Production image
# ────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/deploy ./

EXPOSE 3000

CMD ["node", "dist/main.js"]
