import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.modules.queue.models import QueueEntryStatus


class TokenQueueCreate(BaseModel):
    date: date
    token_number: int
    lawyer_id: int
    client_id: int
    status: QueueEntryStatus | None = None


class TokenQueueUpdate(BaseModel):
    status: QueueEntryStatus
    served_at: datetime | None = None


class TokenQueueOut(BaseModel):
    id: uuid.UUID
    date: date
    token_number: int
    lawyer_id: int
    client_id: int
    status: QueueEntryStatus
    served_at: datetime | None

    model_config = ConfigDict(from_attributes=True)
