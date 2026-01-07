from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CaseCreate(BaseModel):
    title: str
    category: str
    district: str
    summary_public: str
    summary_private: Optional[str] = None


class CaseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    client_id: int
    title: str
    category: str
    district: str
    summary_public: str
    status: str
    selected_lawyer_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class CaseRequestCreate(BaseModel):
    message: Optional[str] = None


class CaseRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    case_id: int
    lawyer_id: int
    message: Optional[str] = None
    status: str
    created_at: datetime
