# syntax=docker/dockerfile:1.6
FROM oven/bun:1 as base

WORKDIR /app

# Install dependencies first to leverage layer caching
COPY bun.lock package.json ./
RUN --mount=type=cache,target=/root/.bun bun install --frozen-lockfile

# Copy source
COPY . .

# Build-time public envs for Vite (VITE_*)
ARG VITE_API_BASE
ARG VITE_WS_BASE
ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_WS_BASE=${VITE_WS_BASE}

# Build static site (dev image can still serve via preview)
RUN --mount=type=cache,target=/app/node_modules/.cache bun run build || true

EXPOSE 8080

# Serve built assets via Vite preview (dev/prod preview)
CMD ["bun", "run", "preview"]
