import uuid
from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict


class QueueEntryStatus(str, Enum):
    waiting = "waiting"
    served = "served"


class QueueEntryOut(BaseModel):
    id: uuid.UUID
    date: date
    token_number: int
    lawyer_id: int
    client_id: int
    status: QueueEntryStatus
    served_at: datetime | None

    model_config = ConfigDict(from_attributes=True)
