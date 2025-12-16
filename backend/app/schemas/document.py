from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentBase(BaseModel):
    booking_id: int
    file_name: str
    file_path: str


class DocumentCreate(DocumentBase):
    pass


class DocumentOut(DocumentBase):
    id: int
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)