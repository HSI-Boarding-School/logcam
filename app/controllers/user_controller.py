from fastapi import HTTPException
from datetime import datetime, timedelta
from jose import jwt
from sqlalchemy.orm import Session
from app.models import User
from app.database import SessionLocal
from pydantic import BaseModel
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 2880 # 2 hari expired token nya


class LoginRequest(BaseModel):
    email: str
    password: str


def verify_password(plain_password: str, hashed_password: str):
    try:
        # pastikan hash dalam bentuk bytes
        hashed_bytes = hashed_password.encode("utf-8")
        password_bytes = plain_password.encode("utf-8")

        return bcrypt.checkpw(password_bytes, hashed_bytes)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Format password hash tidak valid atau tidak bisa diverifikasi."
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
            raise HTTPException(status_code=401, detail="Email tidak terdaftar")

        # Verifikasi password menggunakan bcrypt asli
        if not verify_password(request.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Password salah")

        # Generate JWT token
        access_token = create_access_token({"sub": str(user.id)})

        return {
            "message": "Login berhasil",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
            },
        }
    finally:
        db.close()
