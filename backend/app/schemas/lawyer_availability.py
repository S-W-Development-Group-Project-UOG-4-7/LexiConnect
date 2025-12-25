from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import date, datetime, time
from enum import Enum


class WeekDayEnum(str, Enum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"


class AvailabilityTypeEnum(str, Enum):
    FULL_DAY = "full_day"
    PARTIAL_TIME = "partial_time"


# Weekly Availability Schemas
class WeeklyAvailabilityBase(BaseModel):
    day_of_week: WeekDayEnum
    start_time: str = Field(..., description="Time in HH:MM AM/PM format")
    end_time: str = Field(..., description="Time in HH:MM AM/PM format")
    branch_id: int
    max_bookings: int = Field(default=5, ge=1, le=50)

    @validator('start_time', 'end_time')
    def validate_time_format(cls, v):
        """Validate time format HH:MM AM/PM"""
        import re
        pattern = r'^\d{1,2}:\d{2}\s?(AM|PM|am|pm)$'
        if not re.match(pattern, v.strip()):
            raise ValueError('Time must be in format HH:MM AM/PM')
        return v.strip().upper()

    @validator('end_time')
    def validate_time_order(cls, v, values):
        if 'start_time' in values:
            # Convert to comparable format
            def time_to_minutes(time_str):
                time_part = time_str.split()[0]
                period = time_str.split()[1]
                hours, minutes = map(int, time_part.split(':'))
                if period == 'PM' and hours != 12:
                    hours += 12
                elif period == 'AM' and hours == 12:
                    hours = 0
                return hours * 60 + minutes
            
            start_minutes = time_to_minutes(values['start_time'])
            end_minutes = time_to_minutes(v)
            
            if end_minutes <= start_minutes:
                raise ValueError('End time must be after start time')
        
        return v


class WeeklyAvailabilityCreate(WeeklyAvailabilityBase):
    pass


class WeeklyAvailabilityUpdate(BaseModel):
    day_of_week: Optional[WeekDayEnum] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    branch_id: Optional[int] = None
    max_bookings: Optional[int] = Field(default=None, ge=1, le=50)
    is_active: Optional[bool] = None


class WeeklyAvailabilityResponse(WeeklyAvailabilityBase):
    id: int
    lawyer_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Blackout Date Schemas
class BlackoutDateBase(BaseModel):
    date: date
    availability_type: AvailabilityTypeEnum = AvailabilityTypeEnum.FULL_DAY
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    reason: Optional[str] = None

    @validator('start_time', 'end_time')
    def validate_partial_time_fields(cls, v, values, field):
        if values.get('availability_type') == AvailabilityTypeEnum.PARTIAL_TIME:
            if v is None:
                raise ValueError(f'{field.name} is required for partial time availability')
            # Validate time format
            import re
            pattern = r'^\d{1,2}:\d{2}\s?(AM|PM|am|pm)$'
            if not re.match(pattern, v.strip()):
                raise ValueError('Time must be in format HH:MM AM/PM')
            return v.strip().upper()
        return v

    @validator('end_time')
    def validate_partial_time_order(cls, v, values):
        if (values.get('availability_type') == AvailabilityTypeEnum.PARTIAL_TIME and 
            'start_time' in values and v is not None):
            
            def time_to_minutes(time_str):
                time_part = time_str.split()[0]
                period = time_str.split()[1]
                hours, minutes = map(int, time_part.split(':'))
                if period == 'PM' and hours != 12:
                    hours += 12
                elif period == 'AM' and hours == 12:
                    hours = 0
                return hours * 60 + minutes
            
            start_minutes = time_to_minutes(values['start_time'])
            end_minutes = time_to_minutes(v)
            
            if end_minutes <= start_minutes:
                raise ValueError('End time must be after start time')
        
        return v


class BlackoutDateCreate(BlackoutDateBase):
    pass


class BlackoutDateUpdate(BaseModel):
    date: Optional[date] = None
    availability_type: Optional[AvailabilityTypeEnum] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    reason: Optional[str] = None
    is_active: Optional[bool] = None


class BlackoutDateResponse(BlackoutDateBase):
    id: int
    lawyer_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


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


# Branch Info for dropdown
class BranchInfo(BaseModel):
    id: int
    name: str
    city: str
    district: str
    
    class Config:
        from_attributes = True


# Status Summary
class AvailabilityStatus(BaseModel):
    total_weekly_hours: float
    total_daily_capacity: int
    active_blackouts: int
    weekly_slots_count: int
    blackout_dates_count: int
