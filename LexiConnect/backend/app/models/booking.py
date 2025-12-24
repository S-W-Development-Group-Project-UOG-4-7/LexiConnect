from datetime import date, time

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text, Time, func
from sqlalchemy.orm import relationship

from app.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lawyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    branch_id = Column(Integer, nullable=True)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="PENDING")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    client = relationship("User", foreign_keys=[client_id], back_populates="bookings")
    lawyer = relationship("User", foreign_keys=[lawyer_id])

