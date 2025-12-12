from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLEnum
import enum

from ..database import Base


class KYCStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class LawyerKYC(Base):
    __tablename__ = "lawyer_kyc"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    nic_number = Column(String, nullable=False)
    bar_association_id = Column(String, nullable=False)
    bar_certificate_path = Column(String, nullable=True)
    status = Column(SQLEnum(KYCStatus), nullable=False, default=KYCStatus.PENDING)

