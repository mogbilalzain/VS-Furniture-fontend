# الإصدار المحسن من Dockerfile مع حل المشاكل

FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies including devDependencies for build
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Fix: Set proper environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Fix: Install missing Tailwind dependencies
RUN npm install --save-dev @tailwindcss/postcss tailwindcss postcss autoprefixer

# Fix: Create proper jsconfig.json for path resolution
RUN echo '{ \
  "compilerOptions": { \
    "baseUrl": ".", \
    "paths": { \
      "@/*": ["./*"] \
    } \
  } \
}' > jsconfig.json

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]