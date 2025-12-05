from fastapi import FastAPI
from fastapi.responses import PlainTextResponse

from app.core.cors import setup_cors
from app.core.startup import startup_event
from app.core.shutdown import shutdown_event

from app.database import init_db
from app.routes import log_routes, student_routes, branch_routes, user_routes, auth_routes, role_routes
from app.middleware.admin_middleware import AdminMiddleware


app = FastAPI(root_path="/api", docs_url="/docs", openapi_url="/openapi.json")

setup_cors(app)

init_db()

app.include_router(student_routes.router)
app.include_router(branch_routes.router)
app.include_router(log_routes.router)
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(role_routes.router)

app.add_middleware(AdminMiddleware)

app.on_event("startup")(startup_event)
app.on_event("shutdown")(shutdown_event)


@app.get("/healthz", response_class=PlainTextResponse)
def healthz():

    return {"status": "ok"}

