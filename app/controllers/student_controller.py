from fastapi import UploadFile, File, Form, HTTPException, Query
import numpy as np
import cv2
from app.database import SessionLocal
from app.models import Student, LogBook, Branch
from app.services.face_service import get_face_encoding


class StudentController:
    @staticmethod
    async def register_user(name: str, file: UploadFile, tipe_class: str, branch_id: int):
        db = SessionLocal()
        try:
            branch = db.query(Branch).filter(Branch.id == branch_id).first()
            if not branch:
                raise HTTPException(status_code=404, detail="Branch not found")

            img_bytes = await file.read()
            np_arr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

            # Encode face embedding
            encoding = get_face_encoding(rgb)
            if not encoding:
                return {"error": "Face not detected"}

            student = Student(
                name=name,
                face_embedding=encoding,
                tipe_class=tipe_class,
                branch_id=branch_id
            )
            db.add(student)
            db.commit()
            db.refresh(student)

            return {
                "message": "User registered successfully",
                "user": {
                    "id": student.id,
                    "name": student.name,
                    "branch_id": student.branch_id,
                    "branch_name": branch.name,
                },
            }
        finally:
            db.close()

    @staticmethod
    def get_all_laptop_logs(branch_id: int | None = None):
        db = SessionLocal()
        try:
            query = db.query(LogBook).filter(LogBook.tipe == "LAPTOP").join(Student)
            if branch_id:
                query = query.filter(Student.branch_id == branch_id)

            records = query.all()
            result = [
                {
                    "id": r.id,
                    "student_id": r.student_id,
                    "name": r.student.name if r.student else None,
                    "tipe": r.tipe,
                    "mengambil": r.mengambil,
                    "mengembalikan": r.mengembalikan,
                    "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                    "branch_id": r.student.branch_id if r.student else None,
                }
                for r in records
            ]
            return {"log-laptop": result}
        finally:
            db.close()

    @staticmethod
    def get_all_hp_logs(branch_id: int | None = None):
        db = SessionLocal()
        try:
            query = db.query(LogBook).filter(LogBook.tipe == "HP").join(Student)
            if branch_id:
                query = query.filter(Student.branch_id == branch_id)

            records = query.all()
            result = [
                {
                    "id": r.id,
                    "student_id": r.student_id,
                    "name": r.student.name if r.student else None,
                    "tipe": r.tipe,
                    "mengambil": r.mengambil,
                    "mengembalikan": r.mengembalikan,
                    "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                    "branch_id": r.student.branch_id if r.student else None,
                }
                for r in records
            ]
            return {"log-hp": result}
        finally:
            db.close()

    @staticmethod
    def get_all_users(branch_id: int | None = None):
        db = SessionLocal()
        try:
            query = db.query(Student)
            if branch_id:
                query = query.filter(Student.branch_id == branch_id)

            users = query.all()
            result = [
                {
                    "id": u.id,
                    "name": u.name,
                    "tipe_class": u.tipe_class,
                    "branch_id": u.branch_id,
                    "branch_name": u.branch.name if u.branch else None,
                }
                for u in users
            ]
            return {"users": result}
        finally:
            db.close()
