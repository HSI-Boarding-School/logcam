Logcam Deployment Guide (Ubuntu 22.04 + Docker)

Overview
- Stack: FastAPI backend (Uvicorn), Next.js frontend, MySQL 8, Nginx reverse proxy, Let’s Encrypt (webroot).
- Domain: logcam.naflatech.com
- Compose files: docker-compose.yml (base), docker-compose.prod.yml (SSL override)

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
- All HTTP calls use relative paths under /api (no localhost).
- WebSocket URLs are constructed from window.location to switch automatically to wss on HTTPS.

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
- OpenCV libGL error: addressed via libgl1 and libglib2.0-0 installed in backend image.
- MySQL not ready: backend waits on db healthcheck; if migrations needed later, add a wait-for script.

Security Notes
- Change default MySQL passwords in docker-compose.yml.
- Consider setting up a non-root Linux user and firewall (ufw allow 80,443,22/tcp).
- Restrict Nginx server_name strictly to your domain (already configured in SSL config).

Rollback / Update
- Update code → docker compose up -d --build
- To rollback, checkout previous git commit and rebuild.

