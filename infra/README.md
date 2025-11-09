Infra Layout

Purpose
- Centralize deployment and runtime configuration outside of application code.
- Make it easier to hand off infra to ops/SRE without touching backend/frontend.

Recommended Structure
- compose/         # Docker Compose files (base, dev, prod, deploy overrides)
- nginx/           # Nginx configs (dev proxy, SSL, snippets)
- docker/          # Dockerfiles and related build assets
- certbot/         # ACME/Let’s Encrypt webroot and cert cache (if kept in-repo)
- k8s/             # Optional: Kubernetes manifests (future)

Notes
- This repo currently keeps Nginx configs and Compose files at the repository root for backward compatibility.
- You can gradually migrate by moving the files listed below into this folder and updating paths in CI and docs.

Suggested Migration Plan
1) Move Nginx configs
   - from: nginx/nginx.conf, nginx/nginx-ssl.conf
   - to:   infra/nginx/dev.conf, infra/nginx/prod-ssl.conf
   - Update Compose volume mounts accordingly.

2) Move Compose files
   - from: docker-compose*.yml
   - to:   infra/compose/{docker-compose.yml, docker-compose.dev.yml, docker-compose.prod.yml, docker-compose.deploy.yml}
   - Update CI workflows (.github/workflows/) to new paths.

3) Move Dockerfiles
   - from: Dockerfile.backend, client/Dockerfile, nginx/Dockerfile
   - to:   infra/docker/{backend.Dockerfile, frontend.Dockerfile, web.Dockerfile}
   - Update Compose build contexts and CI build steps.

4) Certbot paths
   - Keep volumes mapped to infra/certbot/{conf,www} for clarity.

Index/Test Pages
- The root-level index.html is a developer test page for WebSocket + camera.
- Consider relocating it to one of:
  - frontend/public/ws-test.html           # Served by Vite/Nginx in dev
  - docs/examples/ws-test.html             # Documentation/example only
  - scripts/dev/ws-test.html               # Dev tools and local testing
- For production images, avoid shipping this test page in the web image.

