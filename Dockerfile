# raemy ai — container image for Google Cloud Run.
# Multi-stage build: install deps, build the Next.js standalone bundle, then ship
# a minimal runtime image. Cloud Run sets $PORT (default 8080); Next honours it.

# ---- deps ----
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----
FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next reads env at build for static optimization; runtime secrets are injected
# by Cloud Run, not baked into the image.
RUN npm run build

# ---- runtime ----
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Cloud Run injects PORT; bind to it and to all interfaces.
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Run as a non-root user (least privilege).
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# The standalone output already contains a trimmed node_modules + server.js.
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
