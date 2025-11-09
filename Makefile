SHELL := /bin/bash

COMPOSE_BASE := infra/compose/docker-compose.yml
COMPOSE_DEV := infra/compose/docker-compose.dev.yml
COMPOSE_PROD := infra/compose/docker-compose.prod.yml
COMPOSE_DEPLOY := infra/compose/docker-compose.deploy.yml

# Ensure project name is consistent across all compose invocations
export COMPOSE_PROJECT_NAME=logcam

.PHONY: dev up down logs restart backend-logs frontend-logs nginx-logs db psql build prod issue-cert deploy
.PHONY: local-backend local-frontend db-up db-down db-create

dev:
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) up -d --build

down:
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) down

logs:
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) logs -f --tail=200

backend-logs:
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) logs -f --tail=200 backend

frontend-logs:
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) logs -f --tail=200 frontend

nginx-logs:
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) logs -f --tail=200 nginx

psql:
	docker compose -f $(COMPOSE_BASE) exec -it db psql -U logcam -d shiners_lms_db

build:
	docker compose -f $(COMPOSE_BASE) build --no-cache

prod:
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) up -d --build

issue-cert:
	docker compose -f $(COMPOSE_BASE) run --rm certbot certonly --webroot -w /var/www/certbot -d logcam.naflatech.com --email you@example.com --agree-tos --no-eff-email

deploy:
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) -f $(COMPOSE_DEPLOY) up -d

# --- Local (no Docker) helpers ---
local-backend:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

local-frontend:
	cd client && bun run dev

db-up:
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) up -d db

db-down:
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) stop db || true

db-create:
	docker compose -f $(COMPOSE_BASE) exec db sh -lc 'PGPASSWORD="$$POSTGRES_PASSWORD" psql -U "$$POSTGRES_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname='
	$(shell sed -n 's/^DB_NAME=\(.*\)/\1/p' .env)
	' | grep -q 1 || PGPASSWORD="$$POSTGRES_PASSWORD" psql -U "$$POSTGRES_USER" -d postgres -c "CREATE DATABASE $$POSTGRES_DB OWNER $$POSTGRES_USER;"'
