from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class IntakeCreate(BaseModel):
    booking_id: int
    client_notes: Optional[str] = None


class IntakeOut(BaseModel):
    id: int
    booking_id: int
    client_notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

