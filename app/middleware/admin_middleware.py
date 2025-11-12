from fastapi import Request
from fastapi.responses import JSONResponse
from jose import jwt, JWTError
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy import select
from app.database import SessionLocal
from app.models import Role, UserRole
from dotenv import load_dotenv
import os

load_dotenv()


class AdminMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        db = SessionLocal()
        try:
            
            public_paths = ["/auth/login", "/users/all", "/users/all/log-hp", "/users/all/log-laptop", "/docs", "/api/openapi.json"]
            if any(request.url.path.startswith(p) for p in public_paths):
                return await call_next(request)

            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return JSONResponse(status_code=401, content={"message": "Authorization token required"})

            token = auth_header.split(" ")[1]

            try:
                payload = jwt.decode(
                    token,
                    os.getenv("JWT_SECRET_KEY", "supersecretkey"),
                    algorithms=["HS256"]
                )
                user_id = payload.get("sub") 
                if not user_id:
                    raise JWTError("Invalid token payload")
            except JWTError:
                return JSONResponse(status_code=401, content={"message": "Invalid or expired token"})

            stmt = (
                select(Role.name)
                .join(UserRole, Role.id == UserRole.role_id)
                .filter(UserRole.user_id == user_id)
            )

            roles = [r[0] for r in db.execute(stmt).all()]

            if "ADMIN" not in roles:
                return JSONResponse(status_code=403, content={"message": "Access forbidden: ADMIN role required"})

            request.state.user = payload

            response = await call_next(request)
            return response

        finally:
            db.close()
