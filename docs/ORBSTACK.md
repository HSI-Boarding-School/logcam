Local Dev via OrbStack Custom Domain

Goal
- Access the app with a friendly domain (e.g., https://logcam.local) on macOS using OrbStack Dev Domains, with working API and WebSockets and camera (HTTPS).

Prerequisites
- OrbStack installed (macOS) and this repo running via Docker Compose.
- Nginx service name: logcam-nginx (already set in docker-compose.yml).

Steps
1) Start the dev stack
   - docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

2) Create a Dev Domain in OrbStack
   - Open OrbStack → Containers → select the container named logcam-nginx
   - Add a Dev Domain (e.g., logcam.local) and map it to port 80
   - Enable HTTPS for the domain if available (OrbStack can provide trusted dev certs)

3) Configure frontend env (pick ONE of these)
   Option A: Same-origin through Nginx (recommended)
   - Edit client/.env.development.local and set:
     VITE_API_BASE=/api
     VITE_WS_BASE=
   - Frontend will call https://logcam.local/api and use wss automatically

   Option B: Absolute URLs to backend
   - Edit client/.env.development.local and set:
     VITE_API_BASE=https://logcam.local/api
     VITE_WS_BASE=wss://logcam.local

4) Allow origin in backend CORS
   - Edit docker-compose.dev.yml backend environment → ALLOWED_ORIGINS, add:
     https://logcam.local
   - Example:
     ALLOWED_ORIGINS: http://localhost,http://127.0.0.1,http://localhost:3000,http://127.0.0.1:3000,http://localhost:8080,http://127.0.0.1:8080,https://logcam.local

5) Restart services
   - docker compose restart backend frontend nginx

6) Test
   - Open https://logcam.local
   - API: https://logcam.local/api/users/all/users
   - Docs: https://logcam.local/api/docs
   - WS: wss://logcam.local/ws/log-laptop

Notes
- Camera (getUserMedia) requires HTTPS on non-localhost origins; enabling HTTPS on the OrbStack Dev Domain resolves this.
- If you prefer multiple domains (e.g., api.logcam.local), you can add more Dev Domains in OrbStack and switch frontend env accordingly.

