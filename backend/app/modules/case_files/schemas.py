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
