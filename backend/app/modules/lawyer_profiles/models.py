from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    func,
)
from app.database import Base


class LawyerProfile(Base):
    __tablename__ = "lawyer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    district = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    specialization = Column(String(255), nullable=True)
    languages = Column(JSON, nullable=True)  # list of strings
    years_of_experience = Column(Integer, nullable=True)
    bio = Column(Text, nullable=True)
    rating = Column(Float, nullable=True, server_default="0")
    is_verified = Column(Boolean, nullable=False, server_default="false")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
