from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DocumentCreate(BaseModel):
    booking_id: int
    uploaded_by_user_id: Optional[int] = None
    original_filename: str
    file_path: str
    content_type: Optional[str] = None
    file_size: int


class DocumentOut(DocumentCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

