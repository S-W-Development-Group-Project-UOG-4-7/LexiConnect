import uuid
from datetime import date

from pydantic import BaseModel, ConfigDict


class BlackoutCreate(BaseModel):
    date: date
    reason: str | None = None


class BlackoutOut(BaseModel):
    id: uuid.UUID
    lawyer_id: int
    date: date
    reason: str | None

    model_config = ConfigDict(from_attributes=True)
