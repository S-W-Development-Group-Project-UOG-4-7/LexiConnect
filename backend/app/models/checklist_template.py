from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class ChecklistTemplate(Base):
    __tablename__ = "checklist_templates"

    id = Column(Integer, primary_key=True, index=True)
    lawyer_id = Column(Integer, ForeignKey("lawyers.id", ondelete="CASCADE"), nullable=False)

    question = Column(String, nullable=False)
    helper_text = Column(String, nullable=True)
    required = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
