# Logcam — FastAPI + Vite/Bun + PostgreSQL

Production‑ready face recognition stack built with FastAPI (Python), Vite/React (Bun), PostgreSQL, and Nginx. Includes Docker Compose for dev/prod, SSL via Let’s Encrypt, and GitHub Actions CI/CD.

## Features
- FastAPI backend with REST endpoints and WebSockets (`/ws/*`)
- Face recognition with `face_recognition` + OpenCV
- PostgreSQL via SQLAlchemy ORM
- Vite/React frontend (Bun) with environment‑based API/WS base
- Nginx reverse proxy + SSL (Let’s Encrypt)
- Dockerized dev and prod workflows + GitHub Actions build/deploy

## Stack
- Backend: Python 3.10, FastAPI, SQLAlchemy, psycopg2-binary
- Frontend: Vite + React, Bun runtime/package manager
- Database: PostgreSQL 16
- Proxy: Nginx (ACME webroot + reverse proxy)

## Infra Layout
- See `infra/README.md` for the recommended structure (nginx, compose, docker, certbot). The repository currently keeps some infra files at the root for backward compatibility.

## Quick Start (Docker, Dev)
```bash
# using Makefile (recommended)
make dev              # start dev stack (Nginx + backend + db + Vite dev)
open http://localhost # app via Nginx → Vite dev
open http://localhost/api/docs # backend docs

# or compose directly
docker compose -f infra/compose/docker-compose.yml -f infra/compose/docker-compose.dev.yml up -d --build
```

Frontend dev env (Vite)
- Configure `client/.env.development.local` (examples in `client/.env.development.local.example`):
```
VITE_API_BASE=http://localhost:8000
VITE_WS_BASE=ws://localhost:8000
```
- For OrbStack custom domain (HTTPS), see `docs/ORBSTACK.md`.

## Production (Docker, Ubuntu 22)
High‑level steps (full guide: `docs/DEPLOYMENT.md`):
- Bring up HTTP: `docker compose up -d --build`
- Issue SSL: `make issue-cert` or
  `docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d logcam.naflatech.com --email you@example.com --agree-tos --no-eff-email`
- Switch to SSL: `make prod` or
  `docker compose -f infra/compose/docker-compose.yml -f infra/compose/docker-compose.prod.yml up -d`
- Access:
  - `https://logcam.naflatech.com`
  - API `https://logcam.naflatech.com/api/...`
  - Docs `https://logcam.naflatech.com/api/docs`
  - WS `wss://logcam.naflatech.com/ws/...`

## Environment Variables (backend)
- `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` (5432), `DB_NAME`
- `ALLOWED_ORIGINS` (comma separated; include dev origins or your domain)

## CI/CD
GitHub Actions builds multi‑arch images (backend, web) and deploys to server via SSH. See `.github/workflows/deploy.yml` and `docs/DEPLOYMENT.md`.

## Makefile Shortcuts
From the repo root:

```
make dev          # start dev stack
make down         # stop dev stack
make prod         # start prod stack with SSL override
make issue-cert   # obtain Let’s Encrypt cert
make deploy       # compose up with deploy override (uses CI images)
make logs         # tail all services
make backend-logs # tail backend
make nginx-logs   # tail Nginx
make psql         # connect to Postgres in container
make local-backend  # run FastAPI locally (no Docker)
make local-frontend # run Vite/Bun locally (no Docker)
make db-up          # start only database in Docker (dev)
make db-down        # stop database container
```

## Local Development (without Docker)
If you prefer to run without Docker:

Backend (FastAPI)
- Requirements: Python 3.10+, local PostgreSQL or Docker DB
- Setup: create `.env` based on `.env.example` and set DB_ vars
- Run:
  - `make local-backend`
  - Visit http://localhost:8000/healthz and http://localhost/api/docs

Frontend (Vite + Bun)
- Requirements: Bun installed
- Env (client/.env.development.local):
  - Direct to backend: `VITE_API_BASE=http://localhost:8000`, `VITE_WS_BASE=ws://localhost:8000`
  - Same-origin via Nginx/OrbStack: `VITE_API_BASE=/api`, `VITE_WS_BASE=`
- Run:
  - `make local-frontend` (http://localhost:8080)

Database only (optional)
- Use Docker to provide Postgres while running apps locally:
  - `make db-up` (starts only the db service)
  - `make db-down` to stop it

## Troubleshooting
- CORS in dev: ensure `ALLOWED_ORIGINS` includes `http://localhost:8080` (Vite) or use Nginx `/api` same‑origin.
- Camera (getUserMedia): requires HTTPS on non‑localhost; use OrbStack dev domain or production SSL.
- dlib/OpenCV build time: first build can be slow; subsequent builds use BuildKit cache.

## License
This project uses third‑party libraries under their respective licenses. No explicit license is provided for this repository.
