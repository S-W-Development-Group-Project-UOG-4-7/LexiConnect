from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class RecentBooking(BaseModel):
    id: int
    client_name: Optional[str]
    status: str
    scheduled_at: Optional[datetime]
    created_at: datetime


class LawyerOverview(BaseModel):
    user_id: int
    full_name: str
    specialization: str
    kyc_status: str
    is_verified: bool


class AdminOverviewResponse(BaseModel):
    total_users: int
    total_lawyers: int
    total_bookings: int
    pending_kyc: int
    verified_lawyers: int
    recent_bookings: List[RecentBooking]
    lawyers: List[LawyerOverview]
