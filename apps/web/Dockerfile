FROM node:24.18.0-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:24.18.0-bookworm-slim AS builder
WORKDIR /app
ARG API_INTERNAL_URL=http://api:8000
ENV API_INTERNAL_URL=$API_INTERNAL_URL
ENV NEXT_BUILD_TARGET=standalone
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24.18.0-bookworm-slim AS runner
WORKDIR /app
ARG API_INTERNAL_URL=http://api:8000
ENV NODE_ENV=production \
    API_INTERNAL_URL=$API_INTERNAL_URL \
    HOSTNAME=0.0.0.0 \
    PORT=3000
RUN groupadd --gid 10001 appgroup && useradd --uid 10001 --gid 10001 --create-home --shell /usr/sbin/nologin appuser
COPY --from=builder /app/public ./public
COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/.next/static ./.next/static
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:3000').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
