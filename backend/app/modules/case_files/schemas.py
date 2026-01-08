from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CaseDocumentOut(BaseModel):
    id: int
    case_id: int
    filename: str
    stored_path: str
    mime_type: Optional[str] = None
    size_bytes: Optional[int] = None
    uploaded_by_user_id: Optional[int] = None
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)

# backend/app/modules/case_files/schemas.py

from typing import Any, Dict, Optional

from pydantic import BaseModel, Field, ConfigDict


class CaseIntakeBase(BaseModel):
    status: Optional[str] = Field(default=None, max_length=20)
    answers_json: Optional[Dict[str, Any]] = None


class CaseIntakeCreate(CaseIntakeBase):
    # For create, we allow answers_json and optional status
    pass


class CaseIntakeUpdate(BaseModel):
    status: Optional[str] = Field(default=None, max_length=20)
    answers_json: Optional[Dict[str, Any]] = None


class CaseIntakeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    case_id: int
    status: str
    answers_json: Optional[Dict[str, Any]] = None

# ---------------------------
# Case Checklist Schemas
# ---------------------------

from typing import List


class CaseChecklistItem(BaseModel):
    key: str
    label: str
    done: bool = False


class CaseChecklistOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    case_id: int
    items_json: List[CaseChecklistItem]


class CaseChecklistIsCompleteOut(BaseModel):
    case_id: int
    is_complete: bool
