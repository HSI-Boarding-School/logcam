from fastapi import APIRouter
from app.controllers.role_controller import get_roles


router = APIRouter(prefix="/roles", tags=["Roles"])

@router.get("/")
def index():
    return get_roles()