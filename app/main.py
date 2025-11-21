import os
from fastapi import FastAPI
from fastapi.responses import PlainTextResponse
from app.database import init_db
from app.routes import auth_routes, log_routes, student_routes, branch_routes, user_routes
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.admin_middleware import AdminMiddleware
from dotenv import load_dotenv

# Mount the app under /api so Nginx can preserve the /api prefix without rewrites
app = FastAPI(root_path="/api", docs_url="/docs", openapi_url="/openapi.json")

load_dotenv()

# Parse allowed origins, ignore empty entries
origins = [o for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o]
allow_all = len(origins) == 0

app.add_middleware(
    CORSMiddleware,
    allow_origins=(origins if not allow_all else ["*"]),
    allow_credentials=(not allow_all),
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(student_routes.router)
app.include_router(branch_routes.router)
app.include_router(log_routes.router)
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.add_middleware(AdminMiddleware)


@app.get("/healthz", response_class=PlainTextResponse, tags=["Health"])
def healthz():
    return "ok"