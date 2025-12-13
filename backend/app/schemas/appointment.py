from datetime import date, time
from enum import Enum

from pydantic import BaseModel, ConfigDict


class AppointmentStatus(str, Enum):
    CONFIRMED = "Confirmed"
    CANCELLED = "Cancelled"
    COMPLETED = "Completed"


class AppointmentBase(BaseModel):
    lawyer_id: int
    client_id: int
    branch_id: int
    date: date
    start_time: time
    status: AppointmentStatus = AppointmentStatus.CONFIRMED


class AppointmentCreate(BaseModel):
    lawyer_id: int
    client_id: int
    branch_id: int
    date: date
    start_time: time


class AppointmentOut(AppointmentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

