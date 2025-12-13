from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer
from sqlalchemy.orm import relationship

from ..database import Base


class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"

    id = Column(Integer, primary_key=True, index=True)

    lawyer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    branch_id = Column(Integer, nullable=True, index=True)

    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False, index=True)

    max_bookings = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)

    lawyer = relationship("User", backref="availability_slots")

    __table_args__ = (
        Index("ix_availability_lawyer_start_end", "lawyer_id", "start_time", "end_time"),
    )
