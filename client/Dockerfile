# syntax=docker/dockerfile:1.6
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy source and build
COPY . .
ARG NEXT_PUBLIC_API_BASE
ARG NEXT_PUBLIC_WS_BASE
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
ENV NEXT_PUBLIC_WS_BASE=${NEXT_PUBLIC_WS_BASE}
RUN --mount=type=cache,target=/app/.next/cache npx next build

EXPOSE 3000

# Run Next.js in production mode
CMD ["npm", "start", "--", "-p", "3000"]
