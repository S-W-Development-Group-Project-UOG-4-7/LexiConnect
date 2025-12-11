from sqlalchemy import Column, Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
import datetime

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lawyer_id = Column(Integer, ForeignKey("lawyers.id"))
    scheduled_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="pending")  # pending / confirmed / cancelled

    user = relationship("User")
    lawyer = relationship("Lawyer")
