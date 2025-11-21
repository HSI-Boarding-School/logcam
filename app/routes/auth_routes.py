from fastapi import APIRouter
from app.controllers.login_controller import login_user, LoginRequest

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(request: LoginRequest):
    return login_user(request)
