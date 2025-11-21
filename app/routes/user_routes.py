from fastapi import APIRouter
from app.controllers.user_controller import (
    create_user, get_users, get_user_by_id, update_user, delete_user
)
from app.schemas.user_schema import UserCreate, UserUpdate

router = APIRouter(prefix="/users")


@router.post("/")
def create(data: UserCreate):
    return create_user(data)


@router.get("/")
def index():
    return get_users()


@router.get("/{user_id}")
def show(user_id: str):
    return get_user_by_id(user_id)


@router.put("/{user_id}")
def update(user_id: str, data: UserUpdate):
    return update_user(user_id, data)


@router.delete("/{user_id}")
def delete(user_id: str):
    return delete_user(user_id)
