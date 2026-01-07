from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSON
# backend/app/modules/intake/models.py

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

    answers_json = Column(JSON, nullable=False, default=dict)
    # JSON answers (Postgres)
    answers_json = Column(JSONB, nullable=False, default=dict)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
