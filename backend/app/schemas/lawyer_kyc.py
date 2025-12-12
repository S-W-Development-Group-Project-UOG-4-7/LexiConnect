from pydantic import BaseModel, ConfigDict
from enum import Enum


class KYCStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class LawyerKYCBase(BaseModel):
    user_id: int
    nic_number: str
    bar_association_id: str
    bar_certificate_path: str | None = None
    status: KYCStatus = KYCStatus.PENDING


class LawyerKYCCreate(BaseModel):
    user_id: int
    nic_number: str
    bar_association_id: str
    bar_certificate_path: str | None = None


class LawyerKYCOut(LawyerKYCBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

