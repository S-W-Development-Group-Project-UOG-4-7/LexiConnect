from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=True, index=True)

    # ✅ safer as nullable (keep using it in API, but DB won't break if missing)
    title = Column(String(255), nullable=True)

    # ✅ DB has NOT NULL constraint, so model must match
    original_filename = Column(String(255), nullable=False)

    # ✅ allow longer paths
    file_path = Column(String(500), nullable=False)

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
