from datetime import datetime
from typing import Dict, Any, Optional

from pydantic import BaseModel, Field, ConfigDict


# -------------------------
# Request schemas
# -------------------------

class IntakeCreate(BaseModel):
    booking_id: int = Field(..., gt=0, description="Booking ID this intake belongs to")
    case_type: str = Field(..., min_length=1, max_length=100)
    subject: str = Field(..., min_length=3, max_length=255)
    details: str = Field(..., min_length=10)
    urgency: str = Field(..., min_length=1, max_length=50)

    # default empty dict avoids null JSON issues
    answers_json: Dict[str, Any] = Field(default_factory=dict)


class IntakeUpdate(BaseModel):
    """
    Partial update schema.
    All fields optional so client/admin can update only what they want.
    """
    case_type: Optional[str] = Field(None, min_length=1, max_length=100)
    subject: Optional[str] = Field(None, min_length=3, max_length=255)
    details: Optional[str] = Field(None, min_length=10)
    urgency: Optional[str] = Field(None, min_length=1, max_length=50)
    answers_json: Optional[Dict[str, Any]] = None


# -------------------------
# Response schema
# -------------------------

class IntakeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    client_id: int

    case_type: str
    subject: str
    details: str
    urgency: str
    answers_json: Dict[str, Any]

    created_at: datetime
    updated_at: datetime
