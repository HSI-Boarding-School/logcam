from fastapi import HTTPException
from app.database import SessionLocal
from app.models import Branch
from pydantic import BaseModel


class BranchCreate(BaseModel):
    name: str


def create_branch_controller(request: BranchCreate):
    db = SessionLocal()
    try:
        branch = Branch(name=request.name)
        db.add(branch)
        db.commit()
        db.refresh(branch)
        return {"message": "Branch created successfully", "branch": branch}
    finally:
        db.close()


def get_all_branches_controller():
    db = SessionLocal()
    try:
        branches = db.query(Branch).all()
        return {"branches": branches}
    finally:
        db.close()


def get_branch_controller(branch_id: int):
    db = SessionLocal()
    try:
        branch = db.query(Branch).filter(Branch.id == branch_id).first()
        if not branch:
            raise HTTPException(status_code=404, detail="Branch not found")
        return {"branch": branch}
    finally:
        db.close()


def update_branch_controller(branch_id: int, name: str = None, address: str = None):
    db = SessionLocal()
    try:
        branch = db.query(Branch).filter(Branch.id == branch_id).first()
        if not branch:
            raise HTTPException(status_code=404, detail="Branch not found")

        if name:
            branch.name = name
        if address:
            branch.address = address
        db.commit()
        db.refresh(branch)
        return {"message": "Branch updated successfully", "branch": branch}
    finally:
        db.close()


def delete_branch_controller(branch_id: int):
    db = SessionLocal()
    try:
        branch = db.query(Branch).filter(Branch.id == branch_id).first()
        if not branch:
            raise HTTPException(status_code=404, detail="Branch not found")
        db.delete(branch)
        db.commit()
        return {"message": "Branch deleted successfully"}
    finally:
        db.close()
