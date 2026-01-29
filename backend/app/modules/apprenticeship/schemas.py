from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AssignApprenticeRequest(BaseModel):
    case_id: int
    apprentice_id: int


class CaseApprenticeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    case_id: int
    lawyer_id: int
    apprentice_id: int
    created_at: datetime


class ApprenticeNoteCreate(BaseModel):
    note: str


class ApprenticeNoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    case_id: int
    apprentice_id: int
    note: str
    created_at: datetime
