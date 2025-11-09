FROM oven/bun:1 AS builder
WORKDIR /app

# Install dependencies
COPY client/bun.lock client/package.json ./
RUN --mount=type=cache,target=/root/.bun bun install --frozen-lockfile

# Build frontend
COPY client/ .
RUN --mount=type=cache,target=/app/node_modules/.cache bun run build
RUN rm -f /app/dist/ws-test.html || true

FROM nginx:stable-alpine

# Copy production Nginx config (SSL + HTTP redirect + proxy for /api, /ws)
COPY nginx/nginx-ssl.conf /etc/nginx/conf.d/default.conf

# Copy built frontend assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80 443
