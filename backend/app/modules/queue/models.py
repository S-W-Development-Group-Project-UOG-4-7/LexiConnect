import uuid
from datetime import date, datetime
from enum import Enum

from sqlalchemy import Date, DateTime, Enum as SQLEnum, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class QueueEntryStatus(str, Enum):
    waiting = "waiting"
    served = "served"


class QueueEntry(Base):
    __tablename__ = "token_queue"
    __table_args__ = (
        UniqueConstraint(
            "lawyer_id",
            "date",
            "token_number",
            name="uq_token_queue_lawyer_date_token_number",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    token_number: Mapped[int] = mapped_column(Integer, nullable=False)
    lawyer_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    client_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )
    status: Mapped[QueueEntryStatus] = mapped_column(
        SQLEnum(QueueEntryStatus, name="token_queue_status"),
        nullable=False,
        default=QueueEntryStatus.waiting,
    )
    served_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
