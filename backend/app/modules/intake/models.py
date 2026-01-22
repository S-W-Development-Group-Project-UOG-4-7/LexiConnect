from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

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

    case_id = Column(
        Integer,
        ForeignKey("cases.id", ondelete="CASCADE"),
        nullable=True,
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

    # JSON answers (Postgres)
    answers_json = Column(JSONB, nullable=False, default=dict)

    # ✅ FIX: updated_at must NOT be nullable + should have default
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),   # ✅ ensures insert gets a value
        onupdate=func.now(),         # ✅ ensures update changes it
        nullable=False
    )
