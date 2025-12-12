from pydantic import BaseModel
from datetime import datetime


class KYCSubmissionCreate(BaseModel):
    nic_number: str
    nic_front_url: str
    nic_back_url: str


class KYCSubmission(BaseModel):
    id: int
    lawyer_id: int
    nic_number: str
    nic_front_url: str
    nic_back_url: str
    status: str
    submitted_at: datetime

    class Config:
        from_attributes = True
