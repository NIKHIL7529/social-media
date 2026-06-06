FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --chown=appuser:appgroup . .
ENV NODE_ENV=production
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s CMD wget --spider http://localhost:8000/api/health || exit 1
CMD ["node", "app.js"]