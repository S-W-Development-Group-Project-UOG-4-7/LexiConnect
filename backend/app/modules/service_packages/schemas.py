from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class ServicePackageCreate(BaseModel):
    name: str
    description: str
    price: Decimal
    duration: int
    active: bool = True

class ServicePackageUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    duration: Optional[int] = None
    active: Optional[bool] = None

class ServicePackageResponse(BaseModel):
    id: int
    name: str
    description: str
    price: Decimal
    duration: int
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True
