from datetime import datetime
from typing import Optional, Dict, Any

from pydantic import BaseModel, ConfigDict


# -------------------------
# CREATE
# -------------------------

class IntakeCreate(BaseModel):
    booking_id: int
    subject: str
    details: str
    urgency: str
    extra_answers: Optional[Dict[str, Any]] = None


# -------------------------
# UPDATE
# -------------------------

class IntakeUpdate(BaseModel):
    subject: Optional[str] = None
    details: Optional[str] = None
    urgency: Optional[str] = None
    answers_json: Optional[Dict[str, Any]] = None


# -------------------------
# RESPONSE
# -------------------------

class IntakeOut(BaseModel):
    id: int
    booking_id: int
    case_id: Optional[int] = None
    client_id: Optional[int] = None

    case_type: str
    subject: str
    details: str
    urgency: str
    answers_json: Dict[str, Any]

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
