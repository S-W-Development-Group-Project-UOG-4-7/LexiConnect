from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Text,
    UniqueConstraint,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class BookingChecklistAnswer(Base):
    __tablename__ = "booking_checklist_answers"
    __table_args__ = (
        UniqueConstraint("booking_id", "template_id", name="uq_booking_template_answer"),
    )

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    template_id = Column(Integer, ForeignKey("checklist_templates.id", ondelete="CASCADE"), nullable=False, index=True)
    answer_text = Column(Text, nullable=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    booking = relationship("Booking", foreign_keys=[booking_id])
    template = relationship("ChecklistTemplate", foreign_keys=[template_id])
    document = relationship("Document", foreign_keys=[document_id])
