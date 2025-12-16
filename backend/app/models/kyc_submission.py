from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from ..database import Base


class KYCSubmission(Base):
    __tablename__ = "kyc_submissions"

    id = Column(Integer, primary_key=True, index=True)
    lawyer_id = Column(Integer, ForeignKey("lawyers.id"))

    full_name = Column(String, nullable=False)
    nic_number = Column(String, nullable=False)
    bar_council_id = Column(String, nullable=False)
    address = Column(String, nullable=False)
    contact_number = Column(String, nullable=False)

    bar_certificate_url = Column(String, nullable=True)

    status = Column(String, default="pending")
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
