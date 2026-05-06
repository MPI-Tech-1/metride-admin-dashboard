# ---------- 1. Base image ----------
FROM node:22-alpine AS base
WORKDIR /app

# ---------- 2. Install deps ----------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---------- 3. Build ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- 4. Production runner ----------
FROM base AS runner
ENV NODE_ENV=production

# Create non-root user (security best practice)
RUN addgroup -g 1001 nodejs
RUN adduser -u 1001 -G nodejs -s /bin/sh -D nextjs

COPY --from=builder /app ./

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
