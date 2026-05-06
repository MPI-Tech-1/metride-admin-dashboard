FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# deps
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# build
FROM base AS builder
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# runner
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup -g 1001 nodejs
RUN adduser -u 1001 -G nodejs -s /bin/sh -D nextjs

COPY --from=builder /app ./

USER nextjs

EXPOSE 3000
CMD ["npm", "start"]
