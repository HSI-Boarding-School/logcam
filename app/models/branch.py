from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.models.base import Base
from datetime import datetime

class Branch(Base):
    __tablename__ = "branches"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(225))
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="branch")
