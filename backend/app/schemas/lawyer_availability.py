from pydantic import BaseModel, Field, field_validator, model_validator
from pydantic import ValidationInfo
from typing import List, Optional
from datetime import date, datetime, time
from enum import Enum
import re
from ..models.lawyer_availability import WeekDay  # Import from model


class AvailabilityTypeEnum(str, Enum):
    FULL_DAY = "full_day"
    PARTIAL_TIME = "partial_time"


TIME_PATTERN = re.compile(r"^\d{1,2}:\d{2}\s?(AM|PM|am|pm)$")


def normalize_time_str(v: str) -> str:
    v = v.strip()
    if not TIME_PATTERN.match(v):
        raise ValueError("Time must be in format HH:MM AM/PM")
    return v.upper()


def time_to_minutes(time_str: str) -> int:
    time_part, period = time_str.split()
    hours, minutes = map(int, time_part.split(":"))
    period = period.upper()

    if period == "PM" and hours != 12:
        hours += 12
    elif period == "AM" and hours == 12:
        hours = 0
    return hours * 60 + minutes


# Weekly Availability Schemas
class WeeklyAvailabilityBase(BaseModel):
    day_of_week: WeekDay
    start_time: str = Field(..., description="Time in HH:MM AM/PM format")
    end_time: str = Field(..., description="Time in HH:MM AM/PM format")
    branch_id: int
    max_bookings: int = Field(default=5, ge=1, le=50)

    @field_validator("start_time", "end_time")
    @classmethod
    def validate_time_format(cls, v: str) -> str:
        return normalize_time_str(v)

    @model_validator(mode="after")
    def validate_time_order(self):
        start_minutes = time_to_minutes(self.start_time)
        end_minutes = time_to_minutes(self.end_time)
        if end_minutes <= start_minutes:
            raise ValueError("End time must be after start time")
        return self


class WeeklyAvailabilityCreate(WeeklyAvailabilityBase):
    pass


class WeeklyAvailabilityUpdate(BaseModel):
    day_of_week: Optional[WeekDay] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    branch_id: Optional[int] = None
    max_bookings: Optional[int] = Field(default=None, ge=1, le=50)
    is_active: Optional[bool] = None

    @field_validator("start_time", "end_time")
    @classmethod
    def validate_optional_time_format(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return normalize_time_str(v)

    @model_validator(mode="after")
    def validate_optional_time_order(self):
        if self.start_time and self.end_time:
            if time_to_minutes(self.end_time) <= time_to_minutes(self.start_time):
                raise ValueError("End time must be after start time")
        return self


class WeeklyAvailabilityResponse(BaseModel):
    id: int
    lawyer_id: int
    day_of_week: WeekDay
    start_time: str
    end_time: str
    branch_id: int
    max_bookings: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    branch: Optional["BranchInfo"] = None

    @field_validator("start_time", "end_time", mode="before")
    @classmethod
    def convert_time_to_string(cls, v):
        """Convert time object to HH:MM AM/PM string if needed"""
        if isinstance(v, time):
            hour = v.hour
            minute = v.minute
            period = "AM" if hour < 12 else "PM"
            hour12 = hour % 12
            if hour12 == 0:
                hour12 = 12
            return f"{hour12}:{minute:02d} {period}"
        return v

    model_config = {"from_attributes": True}


# Blackout Date Schemas
class BlackoutDateBase(BaseModel):
    date: date
    availability_type: AvailabilityTypeEnum = AvailabilityTypeEnum.FULL_DAY
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    reason: Optional[str] = None

    @field_validator("start_time", "end_time")
    @classmethod
    def validate_partial_time_fields(cls, v: Optional[str], info: ValidationInfo) -> Optional[str]:
        # info.data has other already-validated fields in many cases
        availability_type = info.data.get("availability_type")
        if availability_type == AvailabilityTypeEnum.PARTIAL_TIME:
            if v is None:
                # field name available via info.field_name
                raise ValueError(f"{info.field_name} is required for partial time availability")
            return normalize_time_str(v)
        # FULL_DAY: allow None or any string? keep consistent: normalize if string provided
        if v is None:
            return v
        return normalize_time_str(v)

    @model_validator(mode="after")
    def validate_partial_time_order(self):
        if self.availability_type == AvailabilityTypeEnum.PARTIAL_TIME:
            if self.start_time is None or self.end_time is None:
                raise ValueError("start_time and end_time are required for partial time availability")
            if time_to_minutes(self.end_time) <= time_to_minutes(self.start_time):
                raise ValueError("End time must be after start time")
        return self


class BlackoutDateCreate(BlackoutDateBase):
    pass


class BlackoutDateUpdate(BaseModel):
    date: Optional[date] = None
    availability_type: Optional[AvailabilityTypeEnum] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    reason: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("start_time", "end_time")
    @classmethod
    def validate_optional_partial_fields(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return normalize_time_str(v)

    @model_validator(mode="after")
    def validate_update_time_order(self):
        # Only validate order if both times provided
        if self.start_time and self.end_time:
            if time_to_minutes(self.end_time) <= time_to_minutes(self.start_time):
                raise ValueError("End time must be after start time")
        return self


class BlackoutDateResponse(BlackoutDateBase):
    id: int
    lawyer_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# Combined Response Schemas
class LawyerAvailabilityResponse(BaseModel):
    weekly_slots: List[WeeklyAvailabilityResponse]
    blackout_dates: List[BlackoutDateResponse]
    total_weekly_hours: float
    total_daily_capacity: int
    active_blackouts: int


# Bulk Operations
class BulkWeeklyAvailabilityCreate(BaseModel):
    slots: List[WeeklyAvailabilityCreate]


class BulkWeeklyAvailabilityUpdate(BaseModel):
    updates: List[WeeklyAvailabilityUpdate]


class BulkBlackoutDateCreate(BaseModel):
    dates: List[BlackoutDateCreate]


# Branch Info for dropdown (defined early for forward reference)
class BranchInfo(BaseModel):
    id: int
    name: str
    city: str
    district: str

    model_config = {"from_attributes": True}


# Status Summary
class AvailabilityStatus(BaseModel):
    total_weekly_hours: float
    total_daily_capacity: int
    active_blackouts: int
    weekly_slots_count: int
    blackout_dates_count: int
