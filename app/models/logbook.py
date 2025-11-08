from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class LogBook(Base):
    __tablename__ = "log_books"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    tipe = Column(Enum("LAPTOP", "HP", name="tipe_enum"), nullable=False)
    mengambil = Column(Enum("SUDAH", "BELUM", name="mengambil_enum"), default="BELUM")
    mengembalikan = Column(Enum("SUDAH", "BELUM", name="mengembalikan_enum"), default="BELUM")
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="logs")
