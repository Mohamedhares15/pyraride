FROM node:20-slim AS base

FROM base AS deps
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Firebase dummy values to bypass build errors safely without leaking secrets
ENV FIREBASE_PRIVATE_KEY="dummy_key_to_pass_build"
ENV FIREBASE_CLIENT_EMAIL="dummy@dummy.com"
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID="dummy"

# Real DB URL required strictly for Next.js to pre-render static pages during build
ENV DATABASE_URL="postgresql://neondb_owner:npg_XSdWg8ZN9QDT@ep-still-mode-adg5a9nh-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&connection_limit=3&pool_timeout=10"

RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
