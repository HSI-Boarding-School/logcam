from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(225))
    face_embedding = Column(JSON)
    tipe_class = Column(String(225))
    created_at = Column(DateTime, default=datetime.utcnow)

    branch_id = Column(Integer, ForeignKey("branches.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    branch = relationship("Branch", back_populates="student")
    user = relationship("User", back_populates="student")
    logs = relationship("LogBook", back_populates="student")
