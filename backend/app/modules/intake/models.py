# backend/app/modules/intake/models.py

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, JSON, func
from sqlalchemy.orm import relationship

from app.database import Base


class IntakeForm(Base):
    __tablename__ = "intake_forms"

    id = Column(Integer, primary_key=True, index=True)

    booking_id = Column(
        Integer,
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    client_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    case_type = Column(String(100), nullable=False)
    subject = Column(String(255), nullable=False)
    details = Column(Text, nullable=False)
    urgency = Column(String(50), nullable=False)

    # default dict avoids null JSON issues
    answers_json = Column(JSON, nullable=False, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    booking = relationship("Booking", foreign_keys=[booking_id], lazy="joined")
    client = relationship("User", foreign_keys=[client_id], lazy="joined")
