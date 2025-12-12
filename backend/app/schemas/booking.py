from datetime import date, time
from typing import Optional

from pydantic import BaseModel


class BookingBase(BaseModel):
    lawyer_id: int
    branch_id: Optional[int] = None
    date: date
    time: time
    reason: Optional[str] = None


class BookingCreate(BookingBase):
    pass


class BookingOut(BaseModel):
    id: int
    lawyer_name: Optional[str] = None
    branch_name: Optional[str] = None
    date: date
    time: time
    status: str

    class Config:
        orm_mode = True

