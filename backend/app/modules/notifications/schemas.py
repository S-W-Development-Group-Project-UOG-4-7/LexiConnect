from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    type: str
    title: str
    message: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    is_read: bool
    created_at: datetime


class NotificationListOut(BaseModel):
    items: List[NotificationOut]
    total: int


class UnreadCountOut(BaseModel):
    unread_count: int
