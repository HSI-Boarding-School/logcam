from fastapi import HTTPException
from datetime import datetime, timedelta
from jose import jwt
from sqlalchemy.orm import Session
from app.models import User, UserRole, Role, Branch
from app.database import SessionLocal
from pydantic import BaseModel
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 2880  # token expires in 2 days


class LoginRequest(BaseModel):
    email: str
    password: str


def verify_password(plain_password: str, hashed_password: str):
    try:
        hashed_bytes = hashed_password.encode("utf-8")
        password_bytes = plain_password.encode("utf-8")
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid password hash format or not verifiable."
        )


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def login_user(request: LoginRequest):
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == request.email).first()
        if not user:
            raise HTTPException(status_code=401, detail="Email is not registered")

        if not verify_password(request.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Incorrect password")

        user_role = (
            db.query(Role.name)
            .join(UserRole, Role.id == UserRole.role_id)
            .filter(UserRole.user_id == user.id)
            .first()
        )

        if not user_role:
            raise HTTPException(status_code=403, detail="User does not have any role assigned")

        if user_role.name.upper() == "STUDENT":
            raise HTTPException(status_code=403, detail="Access denied: only ADMIN and TEACHER can login")

        branch_name = user.branch.name if user.branch else None

        access_token = create_access_token({"sub": str(user.id), "role": user_role.name})

        return {
            "message": "Login success",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user_role.name,
                "branch_name": branch_name,
            },
        }

    finally:
        db.close()