from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


class AvailabilityCreate(BaseModel):
    start_time: datetime
    end_time: datetime
    branch_id: Optional[int] = None
    max_bookings: int = 1

    @field_validator("end_time")
    @classmethod
    def validate_time_range(cls, end_time: datetime, info):
        start_time = info.data.get("start_time")
        if start_time is not None and end_time <= start_time:
            raise ValueError("end_time must be after start_time")
        return end_time


class AvailabilityUpdate(BaseModel):
    is_active: Optional[bool] = None
    max_bookings: Optional[int] = None


class AvailabilityOut(BaseModel):
    id: int
    lawyer_id: int
    branch_id: Optional[int] = None
    start_time: datetime
    end_time: datetime
    max_bookings: int
    is_active: bool

    class Config:
        from_attributes = True

