Logcam Deployment Guide (Ubuntu 22.04 + Docker)

Overview
- Stack: FastAPI backend (Uvicorn), Next.js frontend, MySQL 8, Nginx reverse proxy, Let’s Encrypt (webroot).
- Domain: logcam.naflatech.com
- Compose files: docker-compose.yml (base), docker-compose.prod.yml (SSL override), docker-compose.dev.yml (local dev)

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
- Requirements: Docker Desktop (macOS) atau Docker Engine + Compose (Linux).
- Jalankan stack dev (hot reload frontend/backend):
  - docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
  - Akses: http://localhost (via Nginx) atau langsung http://localhost:3000 (Next.js dev)
  - Backend live reload: http://localhost:8000/docs (direct) atau /api/docs via Nginx
- Catatan macOS (Apple Silicon): build dlib pertama kali agak lama; pastikan Docker Desktop memberi cukup CPU/RAM.
- Jika host Anda sudah ada MySQL di 3306, hapus mapping port 3306 di docker-compose.dev.yml service db.
 - Perubahan file .env.* di frontend memerlukan restart dev server:
   - docker compose restart frontend
   - atau: docker compose stop frontend && docker compose up -d frontend

macOS Apple Silicon (M1/M2) – Setup Lengkap Docker + Project
1) Install Xcode Command Line Tools (agar git tersedia):
   - xcode-select --install
2) Install Docker Desktop for Mac (Apple Silicon):
   - Unduh: https://www.docker.com/products/docker-desktop/
   - Install dan jalankan Docker Desktop, tunggu sampai ikon Docker menyala (Engine ready).
3) Konfigurasi resource Docker Desktop (disarankan):
   - Settings → Resources → naikkan CPU ke 4 dan Memory ke 6–8 GB (build dlib lebih cepat).
4) Clone project dan masuk ke folder repo:
   - git clone <repo-url>
   - cd <repo-folder>
5) Jalankan stack development (dengan hot reload):
   - docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
6) Akses aplikasi:
   - Frontend via Nginx: http://localhost
   - Frontend dev langsung: http://localhost:3000
   - Backend dev langsung (docs): http://localhost:8000/docs
   - Catatan: getUserMedia (kamera) boleh di http://localhost tanpa HTTPS.
7) Melihat log saat pengembangan:
   - docker compose logs -f backend
   - docker compose logs -f frontend
   - docker compose logs -f nginx
8) Menghentikan stack dev:
   - docker compose -f docker-compose.yml -f docker-compose.dev.yml down
9) Reset database (hapus data MySQL lokal):
   - docker compose down -v   # Hati-hati: menghapus volume db_data

Troubleshooting khusus Mac M1/M2
- Build backend lambat/hang saat memasang dlib/face_recognition:
  - Pastikan Resources cukup (CPU/RAM), jaringan stabil (unduhan dependency), dan ulangi build:
    docker compose -f docker-compose.yml -f docker-compose.dev.yml build backend --no-cache
  - Jika masih gagal, coba tambahkan paket berikut di Dockerfile.backend lalu rebuild: libopenblas-dev gfortran
- Arsitektur container:
  - Default image (python:3.10-slim, mysql:8, node:20) sudah multi-arch dan berjalan di arm64.
  - Hindari memaksa linux/amd64 di Mac M1 karena emulasi QEMU akan membuat build makin lambat.
- Port 80 konflik:
  - Jika ada service lain di port 80, hentikan service itu atau akses langsung http://localhost:3000 (frontend) & http://localhost:8000 (backend).

First Boot (HTTP only)
1) Build and start containers (this brings up Nginx on :80):
   - docker compose up -d --build
2) Verify HTTP serving:
   - Open http://logcam.naflatech.com (Next.js should render)

Issue Let’s Encrypt Certificate (Webroot)
1) Run certbot container to obtain certificate:
   - docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d logcam.naflatech.com --email you@example.com --agree-tos --no-eff-email
   Certificates will be placed under ./certbot/conf/… and mounted into Nginx.

Switch to HTTPS (Production)
- Use the production override file to switch Nginx config to SSL:
  - docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
- Verify:
  - https://logcam.naflatech.com
  - API: https://logcam.naflatech.com/api/users/all/users
  - WS:  wss://logcam.naflatech.com/ws/log-laptop

What’s Already Configured
- Nginx HTTP (nginx/nginx.conf):
  - Serves ACME challenge via /var/www/certbot
  - Proxies / → frontend:3000, /api → backend:8000 (rewritten), /ws → backend:8000 (WebSocket upgrade)
  - client_max_body_size 20m; and WS timeouts are set
- Nginx HTTPS (nginx/nginx-ssl.conf):
  - Same proxy rules; TLS on 443 with Let’s Encrypt paths for logcam.naflatech.com
  - HSTS and modern TLS ciphers enabled
- Docker Compose (docker-compose.yml):
  - Services: db (MySQL 8), backend (FastAPI), frontend (Next.js), nginx (reverse proxy), certbot (utility)
  - Ports: 80, 443 exposed by nginx
  - Volumes: db_data (MySQL data), certbot/conf (certs), certbot/www (webroot)
- Docker Compose Prod Override (docker-compose.prod.yml):
  - Switches Nginx to nginx-ssl.conf and sets backend ALLOWED_ORIGINS to https://logcam.naflatech.com

Environment & Secrets
- Backend gets DB credentials from compose env (not .env).
- CORS (ALLOWED_ORIGINS) includes https://logcam.naflatech.com but is not strictly required since frontend and backend are same origin via Nginx.
- MySQL credentials are set for demo; change MYSQL_ROOT_PASSWORD and MYSQL_PASSWORD.

Frontend Refactor Notes
- HTTP calls read base from env: NEXT_PUBLIC_API_BASE (default: /api). Examples:
  - Dev direct to backend: http://localhost:8000
  - Behind Nginx: /api
- WebSocket base reads from env: NEXT_PUBLIC_WS_BASE (default: derive from window origin)
  - Dev direct to backend: ws://localhost:8000
  - Behind Nginx: leave empty to auto use wss://<host>

Environment files (frontend)
- Files provided:
  - client/.env.example → generic example
  - client/.env.development.local.example → local dev direct-backend
  - client/.env.production.local.example → production domain example
- Local dev (inside container, hot reload):
  - cp client/.env.development.local.example client/.env.development.local
  - Values:
    - NEXT_PUBLIC_API_BASE=http://localhost:8000
    - NEXT_PUBLIC_WS_BASE=ws://localhost:8000
- Production build (Docker image):
  - We pass env at build-time via Docker build args (see docker-compose.prod.yml).
  - Alternatively, you can create client/.env.production.local before build, but note client/.dockerignore ignores .env* by default; using build args is preferred.

Common Operations
- Logs: docker compose logs -f nginx | backend | frontend | db
- Rebuild after code change: docker compose up -d --build
- Restart single service: docker compose restart backend
- DB shell: docker compose exec -it db mysql -ulogcam -p

Automatic Renewal
- Add a cron on the host (renew + reload Nginx):
  - crontab -e
  - 0 3 * * * cd /path/to/repo && docker compose run --rm certbot renew -w /var/www/certbot --quiet && docker compose exec -T nginx nginx -s reload

Troubleshooting
- 413 Request Entity Too Large on uploads: already mitigated by client_max_body_size 20m in both Nginx configs.
- WebSocket disconnects after 60s: WS timeouts in Nginx are set to 3600s.
- face_recognition/dlib build slow/fails: ensure build completes on first docker build; the Dockerfile includes build-essential, cmake, libatlas; if build issues persist, add libopenblas-dev and gfortran, then rebuild.
- On macOS Apple Silicon: if build fails due to arm64, force platform on services in compose (e.g., platform: linux/arm64) or increase resources. MySQL 8 and Node 20 provide arm64 images.
- OpenCV libGL error: addressed via libgl1 and libglib2.0-0 installed in backend image.
- MySQL not ready: backend waits on db healthcheck; if migrations needed later, add a wait-for script.

Security Notes
- Change default MySQL passwords in docker-compose.yml.
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
  - client/Dockerfile → npm cache: --mount=type=cache,target=/root/.npm and Next cache: /app/.next/cache
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
- Build & deploy: .github/workflows/deploy.yml

4) How it works
- Build & push multi-arch images to GHCR with tags: latest and commit SHA.
- SSH to server, set BACKEND_IMAGE and FRONTEND_IMAGE env, and run:
  - docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.deploy.yml up -d
- The override file docker-compose.deploy.yml injects images and disables local builds on server.

5) First-time deploy notes
- You may need to switch nginx config to SSL after cert issuance (use docker-compose.prod.yml override).
- Ensure docker on server is logged-in to ghcr.io (workflow logs in before pulling).
