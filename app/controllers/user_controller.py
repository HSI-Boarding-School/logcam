from fastapi import HTTPException
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, UserRole, Role
import bcrypt


def hash_password(password: str):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# =========================
# CREATE USER
# =========================
def create_user(data):
    db: Session = SessionLocal()

    try:
        # Cek email unik
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(400, "Email already registered")

        hashed_pw = hash_password(data.password)

        new_user = User(
            name=data.name,
            email=data.email,
            password_hash=hashed_pw,
            branch_id=data.branch_id,
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Assign Role
        if data.role_id:
            role_link = UserRole(
                user_id=new_user.id,
                role_id=data.role_id
            )
            db.add(role_link)
            db.commit()

        return {
            "message": "User created successfully",
            "user_id": str(new_user.id)
        }

    finally:
        db.close()


# =========================
# GET ALL USERS
# =========================
def get_users():
    db: Session = SessionLocal()
    try:
        users = (
            db.query(User)
            .filter(User.deleted_at == None)
            .all()
        )

        result = []
        for u in users:
            role = (
                db.query(Role.name)
                .join(UserRole, Role.id == UserRole.role_id)
                .filter(UserRole.user_id == u.id)
                .first()
            )

            result.append({
                "id": str(u.id),
                "name": u.name,
                "email": u.email,
                "branch_id": u.branch_id,
                "is_active": u.is_active,
                "role": role.name if role else None,
            })

        return result

    finally:
        db.close()


# =========================
# GET USER BY ID
# =========================
def get_user_by_id(user_id: str):
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id, User.deleted_at == None).first()
        if not user:
            raise HTTPException(404, "User not found")

        return {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "branch_id": user.branch_id,
            "is_active": user.is_active,
            "created_at": user.created_at,
        }

    finally:
        db.close()


# =========================
# UPDATE USER
# =========================
def update_user(user_id: str, data):
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id, User.deleted_at == None).first()
        if not user:
            raise HTTPException(404, "User not found")

        # Cek email unik
        if data.email and data.email != user.email:
            exist = db.query(User).filter(User.email == data.email).first()
            if exist:
                raise HTTPException(400, "Email already in use")

        if data.name:
            user.name = data.name

        if data.email:
            user.email = data.email

        if data.password:
            user.password_hash = hash_password(data.password)

        if data.branch_id is not None:
            user.branch_id = data.branch_id

        if data.is_active is not None:
            user.is_active = data.is_active

        # Update Role jika ada
        if data.role_id:
            db.query(UserRole).filter(UserRole.user_id == user.id).delete()
            db.commit()

            new_role = UserRole(
                user_id=user.id,
                role_id=data.role_id
            )
            db.add(new_role)

        db.commit()
        return {"message": "User updated successfully"}

    finally:
        db.close()


# =========================
# DELETE USER (SOFT DELETE)
# =========================
def delete_user(user_id: str):
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id, User.deleted_at == None).first()
        if not user:
            raise HTTPException(404, "User not found")

        user.deleted_at = datetime.utcnow()

        db.commit()

        return {"message": "User deleted successfully"}

    finally:
        db.close()
