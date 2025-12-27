from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ChecklistTemplateCreate(BaseModel):
    question: str
    helper_text: Optional[str] = None
    required: bool = False


class ChecklistTemplateUpdate(BaseModel):
    question: Optional[str] = None
    helper_text: Optional[str] = None
    required: Optional[bool] = None


class ChecklistTemplateResponse(BaseModel):
    id: int
    question: str
    helper_text: Optional[str] = None
    required: bool
    created_at: datetime

    class Config:
        from_attributes = True
