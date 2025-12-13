from pydantic import BaseModel
from datetime import datetime


class KYCSubmissionCreate(BaseModel):
    full_name: str
    nic_number: str
    bar_council_id: str
    address: str
    contact_number: str
    bar_certificate_url: str | None = None


class KYCSubmission(BaseModel):
    id: int
    lawyer_id: int

    full_name: str
    nic_number: str
    bar_council_id: str
    address: str
    contact_number: str

    bar_certificate_url: str | None
    status: str
    submitted_at: datetime

    class Config:
        from_attributes = True
