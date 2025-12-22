from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ---------- Request schema ----------
class KYCSubmitRequest(BaseModel):
    full_name: str
    nic_number: str
    bar_council_id: str
    address: str
    contact_number: str
    bar_certificate_url: Optional[str] = None


# ---------- Response schema ----------
class KYCResponse(BaseModel):
    id: int
    lawyer_id: int
    full_name: str
    nic_number: str
    bar_council_id: str
    address: str
    contact_number: str
    bar_certificate_url: Optional[str]
    status: str
    submitted_at: datetime

    class Config:
        from_attributes = True
