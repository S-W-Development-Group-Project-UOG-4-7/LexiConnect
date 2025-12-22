# backend/app/modules/disputes/schemas.py

from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, Field, ConfigDict


# -------------------------
# Request schemas
# -------------------------

class DisputeCreate(BaseModel):
    """Client creates a dispute."""
    booking_id: Optional[int] = None
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)


class DisputeUpdate(BaseModel):
    """Client updates dispute (only if PENDING)."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)


class DisputeAdminUpdate(BaseModel):
    """Admin updates dispute status/admin note."""
    status: Optional[Literal["PENDING", "RESOLVED", "REJECTED"]] = None
    admin_note: Optional[str] = None


# -------------------------
# Response schema
# -------------------------

class DisputeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: Optional[int]
    client_id: int
    title: str
    description: str
    status: str
    admin_note: Optional[str]
    created_at: datetime
    updated_at: datetime
