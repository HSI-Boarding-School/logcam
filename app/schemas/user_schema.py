from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    branch_id: Optional[int] = None
    role_id: Optional[UUID] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    branch_id: Optional[int] = None
    role_id: Optional[UUID] = None
    is_active: Optional[bool] = None
