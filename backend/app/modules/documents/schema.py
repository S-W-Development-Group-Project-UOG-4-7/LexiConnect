from pydantic import BaseModel
from datetime import datetime

class DocumentOut(BaseModel):
    id: int
    booking_id: int | None = None
    case_id: int | None = None
    title: str
    file_path: str
    uploaded_at: datetime

    class Config:
        from_attributes = True
