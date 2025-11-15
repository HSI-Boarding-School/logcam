from fastapi import APIRouter, UploadFile, File, Form, Query
from app.controllers.student_controller import StudentController
from typing import Optional

router = APIRouter(prefix="/students", tags=["Students"])

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
def get_all_students(branch_id: int = Query(None, description="Filter by branch ID")):
    return StudentController.get_all_students(branch_id)


@router.delete("/{student_id}")
def delete_student(student_id: int):
    return StudentController.delete_student(student_id)



@router.put("/{student_id}")
async def update_student_route(
    student_id: int,
    name: Optional[str] = Form(None),
    tipe_class: Optional[str] = Form(None),
    branch_id: Optional[str] = Form(None), 
    file: Optional[UploadFile] = File(None)
):
    branch_id_int = int(branch_id) if branch_id not in (None, "", "null") else None

    return await StudentController.update_student(
        student_id=student_id,
        name=name,
        tipe_class=tipe_class,
        branch_id=branch_id_int,
        file=file
    )


