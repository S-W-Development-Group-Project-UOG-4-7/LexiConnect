from datetime import datetime
from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SQLEnum, Integer, String, func
from sqlalchemy.orm import relationship

from app.database import Base


class UserRole(str, Enum):
    client = "client"
    lawyer = "lawyer"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.client)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    lawyer = relationship("Lawyer", back_populates="user", uselist=False)

    # Relationship placeholder; links to bookings where the user is the client
    bookings = relationship(
        "Booking",
        back_populates="client",
        cascade="all, delete-orphan",
        foreign_keys="Booking.client_id",
    )

