from sqlalchemy import Column, Integer, String, DateTime, BigInteger
from sqlalchemy.sql import func

from app.database import Base


class CaseDocument(Base):
    __tablename__ = "case_documents"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, nullable=False, index=True)

    filename = Column(String(255), nullable=False)
    stored_path = Column(String, nullable=False)

    mime_type = Column(String(255), nullable=True)
    size_bytes = Column(BigInteger, nullable=True)

    uploaded_by_user_id = Column(Integer, nullable=True)

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

# backend/app/modules/case_files/models.py

from sqlalchemy import Column, Integer, String, DateTime, func, Index
from sqlalchemy.dialects.postgresql import JSONB

from app.database import Base


class CaseIntake(Base):
    __tablename__ = "case_intakes"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, nullable=False, unique=True, index=True)

    status = Column(String(20), nullable=False, server_default="draft")
    answers_json = Column(JSONB, nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


Index("ix_case_intakes_case_id", CaseIntake.case_id)
