from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class BookingCreate(BaseModel):
    lawyer_id: int
    branch_id: Optional[int] = None
    scheduled_at: Optional[datetime] = None
    note: Optional[str] = None


class BookingOut(BaseModel):
    id: int
    client_id: int
    lawyer_id: int
    branch_id: Optional[int] = None
    scheduled_at: Optional[datetime] = None
    note: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookingUpdate(BaseModel):
    lawyer_id: Optional[int] = None
    branch_id: Optional[int] = None
    scheduled_at: Optional[datetime] = None
    note: Optional[str] = None
    status: Optional[str] = None


class BookingCancelOut(BaseModel):
    id: int
    status: str

    model_config = ConfigDict(from_attributes=True)
