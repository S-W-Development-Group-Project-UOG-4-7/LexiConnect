from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class IntakeCreate(BaseModel):
    booking_id: int
    client_notes: Optional[str] = None


class IntakeOut(BaseModel):
    id: int
    booking_id: int
    case_id: Optional[int] = None
    client_id: int

    case_type: str
    subject: str
    details: str
    urgency: str
    answers_json: Dict[str, Any]

    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)

