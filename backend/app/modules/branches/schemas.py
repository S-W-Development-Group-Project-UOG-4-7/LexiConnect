from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BranchCreate(BaseModel):
    name: str
    district: str
    city: str
    address: str


class BranchUpdate(BaseModel):
    name: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None


class BranchResponse(BaseModel):
    id: int
    name: str
    district: str
    city: str
    address: str
   
    class Config:
        from_attributes = True
