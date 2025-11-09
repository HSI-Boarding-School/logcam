from fastapi import APIRouter
from app.controllers.branch_controller import (
    create_branch_controller,
    get_all_branches_controller,
    get_branch_controller,
    update_branch_controller,
    delete_branch_controller,
    BranchCreate
)

router = APIRouter(prefix="/branches", tags=["Branches"])


@router.post("/")
def create_branch(request: BranchCreate):
    return create_branch_controller(request)

@router.get("/")
def get_all_branches():
    return get_all_branches_controller()


@router.get("/{branch_id}")
def get_branch(branch_id: int):
    return get_branch_controller(branch_id)


@router.put("/{branch_id}")
def update_branch(branch_id: int, name: str = None, address: str = None):
    return update_branch_controller(branch_id, name, address)


@router.delete("/{branch_id}")
def delete_branch(branch_id: int):
    return delete_branch_controller(branch_id)
