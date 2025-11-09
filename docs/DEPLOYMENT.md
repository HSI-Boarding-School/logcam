Logcam Deployment Guide (Ubuntu 22.04 + Docker)

Overview
- Stack: FastAPI backend (Uvicorn), Vite/React frontend (Bun), PostgreSQL 16, Nginx reverse proxy, Let’s Encrypt (webroot).
- Domain: logcam.naflatech.com
- Compose files: infra/compose/docker-compose.yml (base), infra/compose/docker-compose.prod.yml (SSL), infra/compose/docker-compose.dev.yml (local dev)

Quick Commands (from repo root)
- make dev          # start dev stack (Nginx + backend + db + Vite dev)
- make down         # stop dev stack
- make prod         # start prod stack (Nginx SSL + backend + db)
- make issue-cert   # obtain Let’s Encrypt cert (first time)
- make deploy       # start stack with deploy override (uses CI images)
- make logs         # tail all services
- make backend-logs # tail backend
- make nginx-logs   # tail Nginx
- make psql         # connect to Postgres in container

Prerequisites
- Ubuntu 22.04 VPS with sudo access.
- DNS A/AAAA record: logcam.naflatech.com → your VPS IP.
- Install Docker Engine + Compose plugin:
  - sudo apt update && sudo apt install -y ca-certificates curl gnupg
  - sudo install -m 0755 -d /etc/apt/keyrings
  - curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  - echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  - sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  - sudo usermod -aG docker $USER && newgrp docker

Clone Project
- git clone <repo-url>
- cd <repo-folder>

Local Development (macOS/Linux)
- Requirements: Docker Desktop (macOS) or Docker Engine + Compose (Linux).
- Start dev stack (hot reload frontend/backend):
  - docker compose -f infra/compose/docker-compose.yml -f infra/compose/docker-compose.dev.yml up -d --build
  - Access: http://localhost (via Nginx) or directly http://localhost:8080 (Vite dev)
  - Backend live reload: http://localhost:8000/docs (direct) or http://localhost/api/docs via Nginx
- macOS Apple Silicon: the first dlib build can be slow; allocate enough CPU/RAM in Docker Desktop.
- If PostgreSQL is already running on host port 5432, remove that port mapping from infra/compose/docker-compose.dev.yml.
- When changing frontend .env, restart the dev server:
  - docker compose restart frontend
  - or: docker compose stop frontend && docker compose up -d frontend

macOS Apple Silicon (M1++) – Full Setup
1) Install Xcode Command Line Tools (for git):
   - xcode-select --install
2) Install Docker Desktop for Mac (Apple Silicon):
   - https://www.docker.com/products/docker-desktop/
3) Resource tuning (recommended):
   - Settings → Resources → CPU 4, Memory 6–8 GB
4) Clone repo and start dev:
   - git clone <repo-url>
   - cd <repo-folder>
   - docker compose -f infra/compose/docker-compose.yml -f infra/compose/docker-compose.dev.yml up -d --build
5) Access:
   - Frontend via Nginx: http://localhost
   - Frontend dev directly: http://localhost:8080
   - Backend docs: http://localhost:8000/docs
6) Logs during dev:
   - docker compose logs -f backend | frontend | nginx
7) Stop dev stack:
   - docker compose -f infra/compose/docker-compose.yml -f infra/compose/docker-compose.dev.yml down
8) Reset local DB (removes volume):
   - docker compose down -v

macOS Apple Silicon Troubleshooting
- Backend build is slow/hangs while compiling dlib/face_recognition:
  - Ensure sufficient Docker resources (CPU/RAM), stable network, and rebuild:
    docker compose -f infra/compose/docker-compose.yml -f infra/compose/docker-compose.dev.yml build backend --no-cache
  - If it still fails, consider adding: libopenblas-dev gfortran to backend Dockerfile and rebuild
- Container architecture:
  - Default images (python:3.10-slim, postgres:16, node:20) are multi-arch and run on arm64.
  - Avoid forcing linux/amd64 on M1/M2; QEMU emulation is much slower.
- Port 80 conflict:
  - If another service uses port 80, stop it or access http://localhost:8080 (frontend dev) & http://localhost:8000 (backend) directly.

First Boot (HTTP only)
1) Build and start containers (this brings up Nginx on :80):
   - docker compose -f infra/compose/docker-compose.yml up -d --build
   - Or: make prod (with SSL override below)
   - Or: make prod (with SSL override below)
2) Verify HTTP serving:
   - Open http://logcam.naflatech.com (may 404 until CI-built web image is deployed)

Issue Let’s Encrypt Certificate (Webroot)
1) Run certbot container to obtain certificate:
   - docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d logcam.naflatech.com --email you@example.com --agree-tos --no-eff-email
   - Or: make issue-cert
   Certificates will be placed under ./certbot/conf/… and mounted into Nginx.

Switch to HTTPS (Production)
- Use the production override file to switch Nginx config to SSL:
  - docker compose -f infra/compose/docker-compose.yml -f infra/compose/docker-compose.prod.yml up -d
  - Or: make prod
- Verify:
  - https://logcam.naflatech.com
  - API: https://logcam.naflatech.com/api/users/all/users
  - WS:  wss://logcam.naflatech.com/ws/log-laptop
  - FastAPI docs: https://logcam.naflatech.com/api/docs

What’s Already Configured
- Nginx HTTP (infra/nginx/dev.conf):
  - Serves ACME challenge via /var/www/certbot
  - Proxies / → frontend:8080 (dev), /api → backend:8000 (no rewrite), /ws → backend:8000 (WebSocket upgrade)
  - client_max_body_size 20m; WS timeouts and gzip/security headers are set
- Nginx HTTPS (infra/nginx/prod-ssl.conf):
  - Serves static frontend build from /usr/share/nginx/html; proxies /api and /ws; TLS on 443 with Let’s Encrypt; gzip and security headers configured
  - HSTS and modern TLS ciphers enabled
- Docker Compose (infra/compose/docker-compose.yml):
  - Services: db (PostgreSQL 16), backend (FastAPI), frontend (Vite/Bun, dev), nginx (reverse proxy), certbot (utility)
  - Ports: 80, 443 exposed by nginx
  - Volumes: db_data (PostgreSQL data), certbot/conf (certs), certbot/www (webroot)
- Docker Compose Prod Override (infra/compose/docker-compose.prod.yml):
  - Switches Nginx to prod-ssl.conf and sets backend ALLOWED_ORIGINS to your domain

Environment & Secrets
- Backend gets DB credentials from compose env (not .env).
- CORS (ALLOWED_ORIGINS) includes https://logcam.naflatech.com but is not strictly required since frontend and backend are same origin via Nginx.
- PostgreSQL credentials are set for demo; change POSTGRES_PASSWORD.

Frontend Refactor Notes
- HTTP calls read base from env: VITE_API_BASE (default: /api). Examples:
  - Dev direct to backend: http://localhost:8000
  - Behind Nginx: /api
- WebSocket base reads from env: VITE_WS_BASE (default: derive from window origin)
  - Dev direct to backend: ws://localhost:8000
  - Behind Nginx: leave empty to auto use wss://<host>
  - FastAPI docs now available at /api/docs (configured in app.main)

Environment files (frontend)
- Files provided:
  - client/.env.example → generic example
  - client/.env.development.local.example → local dev direct-backend
  - client/.env.production.local.example → production domain example
- Local dev (inside container, hot reload):
  - cp client/.env.development.local.example client/.env.development.local
  - Values:
    - VITE_API_BASE=http://localhost:8000
    - VITE_WS_BASE=ws://localhost:8000
- Production build (Docker image):
- We pass env at build-time via Docker build args (see infra/compose/docker-compose.prod.yml).
  - Alternatively, you can create client/.env.production.local before build, but note client/.dockerignore ignores .env* by default; using build args is preferred.

Common Operations
- Logs: docker compose logs -f nginx | backend | frontend | db
- Rebuild after code change: docker compose up -d --build
- Restart single service: docker compose restart backend
- DB shell: docker compose exec -it db psql -U logcam -d shiners_lms_db
- Health endpoints: backend /healthz (liveness). Nginx also exposes /healthz (200 OK)

Automatic Renewal
- Add a cron on the host (renew + reload Nginx):
  - crontab -e
  - 0 3 * * * cd /path/to/repo && docker compose run --rm certbot renew -w /var/www/certbot --quiet && docker compose exec -T nginx nginx -s reload

Troubleshooting
- 413 Request Entity Too Large on uploads: already mitigated by client_max_body_size 20m in both Nginx configs.
- WebSocket disconnects after 60s: WS timeouts in Nginx are set to 3600s.
- face_recognition/dlib build slow/fails: ensure build completes on first docker build; the Dockerfile includes build-essential, cmake, libatlas; if build issues persist, add libopenblas-dev and gfortran, then rebuild.
- On macOS Apple Silicon: if build fails due to arm64, force platform on services in compose (e.g., platform: linux/arm64) or increase resources. PostgreSQL 16 and Node 20 provide arm64 images.
- OpenCV libGL error: addressed via libgl1 and libglib2.0-0 installed in backend image.
- PostgreSQL not ready: backend waits on db healthcheck; if migrations needed later, add a wait-for script.

Security Notes
- Change default PostgreSQL password in infra/compose/docker-compose.yml.
- Consider setting up a non-root Linux user and firewall (ufw allow 80,443,22/tcp).
- Restrict Nginx server_name strictly to your domain (already configured in SSL config).

Rollback / Update
- Update code → docker compose up -d --build
- To rollback, checkout previous git commit and rebuild.

CI Build Cache (faster builds)
- This repo includes BuildKit cache mounts in Dockerfiles and a GitHub Actions workflow to reuse layers across runs.
- Files:
  - .github/workflows/docker-build.yml → uses buildx with cache-from/to type=gha
  - Dockerfile.backend → pip cache: --mount=type=cache,target=/root/.cache/pip
  - client/Dockerfile → Bun cache: --mount=type=cache,target=/root/.bun and Vite cache during build
- Local BuildKit usage:
  - export DOCKER_BUILDKIT=1
  - docker buildx create --use || true
  - docker buildx build --load -f Dockerfile.backend .
- In CI (GitHub Actions), workflow builds both backend and frontend for linux/amd64 and linux/arm64 with cached layers.

CI/CD Deployment to Ubuntu 22 (GitHub Actions)
Recommended: image-based deploy via GHCR (no build on server).

1) Server prerequisites (run once on the server)
- Install Docker Engine + Compose (see prerequisites above).
- Create project directory: sudo mkdir -p /opt/logcam && sudo chown -R $USER:$USER /opt/logcam
- Clone repo once (workflow can also clone):
  - cd /opt/logcam && git clone <repo-url> .
- Ensure ports 80 and 443 open (ufw allow 'Nginx Full').
- Issue initial certificate (optional to do via workflow; manual is simpler first time):
  - docker compose up -d
  - docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d logcam.naflatech.com --email you@example.com --agree-tos --no-eff-email

2) Repository secrets (GitHub → Settings → Secrets and variables → Actions)
- SSH_HOST: your.server.ip.or.hostname
- SSH_USER: deploy user (must have permissions on /opt/logcam and docker)
- SSH_PORT: 22 (or custom)
- SSH_KEY: private key PEM for the deploy user (no passphrase or use ssh-agent)

3) Workflow files
- Build cache: .github/workflows/docker-build.yml
- Build & deploy: .github/workflows/deploy.yml (builds backend, frontend, and web images)

4) How it works
- Build & push multi-arch images to GHCR with tags: latest and commit SHA (backend, frontend, and web images).
- SSH to server, set BACKEND_IMAGE, FRONTEND_IMAGE, and NGINX_IMAGE env, and run:
  - docker compose -f infra/compose/docker-compose.yml -f infra/compose/docker-compose.prod.yml -f infra/compose/docker-compose.deploy.yml up -d
- The override file infra/compose/docker-compose.deploy.yml injects images and disables local builds on server.

5) First-time deploy notes
- You may need to switch Nginx config to SSL after cert issuance (use infra/compose/docker-compose.prod.yml override).
- Ensure docker on server is logged-in to ghcr.io (workflow logs in before pulling).

Infra Layout (optional consolidation)
- This repository introduces `infra/` to centralize deployment artifacts:
  - infra/nginx/ → Nginx configs (dev/prod)
  - infra/compose/ → Compose files (base, dev, prod, deploy)
  - infra/docker/ → Dockerfiles (backend, frontend, web)
  - infra/certbot/ → ACME webroot and cert cache
- Current configs remain at the repository root for backward compatibility. Migrate gradually and update paths in Compose and CI workflows when ready.
