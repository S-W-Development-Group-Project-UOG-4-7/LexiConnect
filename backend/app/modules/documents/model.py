from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, index=True)

    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
