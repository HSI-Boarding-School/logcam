from fastapi import APIRouter, UploadFile, File, Form, Query
from app.controllers.student_controller import StudentController

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/register")
async def register_user(
    name: str = Form(...),
    file: UploadFile = File(...),
    tipe_class: str = Form(...),
    branch_id: int = Form(...)
):
    return await StudentController.register_user(name, file, tipe_class, branch_id)


@router.get("/all/log-laptop")
def get_all_laptop_logs(branch_id: int = Query(None, description="Filter by branch ID")):
    return StudentController.get_all_laptop_logs(branch_id)


@router.get("/all/log-hp")
def get_all_hp_logs(branch_id: int = Query(None, description="Filter by branch ID")):
    return StudentController.get_all_hp_logs(branch_id)


@router.get("/all")
def get_all_users(branch_id: int = Query(None, description="Filter by branch ID")):
    return StudentController.get_all_users(branch_id)
